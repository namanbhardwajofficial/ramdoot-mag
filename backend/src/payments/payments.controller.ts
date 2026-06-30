import { Controller, Post, Get, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a successful payment' })
  async createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(
      user.id,
      dto.razorpayPaymentId,
      dto.amount,
      dto.relatedType,
      dto.relatedId,
      dto.description,
    );
  }

  @Get('payments/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my payment history' })
  async myPayments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getUserPayments(user.id, page || 1, limit || 20);
  }

  @Post('webhooks/razorpay')
  @Public()
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async razorpayWebhook(@Body() body: any) {
    // In production, verify webhook signature here
    const event = body.event;
    const payload = body.payload;
    return this.paymentsService.handleWebhook(event, payload);
  }
}
