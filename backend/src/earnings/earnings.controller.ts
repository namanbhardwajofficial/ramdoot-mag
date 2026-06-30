import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Earnings & Payouts')
@ApiBearerAuth()
@Controller()
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings overview and balance' })
  async getEarnings(@CurrentUser() user: AuthenticatedUser) {
    return this.earningsService.getEarnings(user.id);
  }

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Add a bank account for payouts' })
  async addBankAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddBankAccountDto,
  ) {
    return this.earningsService.addBankAccount(user.id, dto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get my bank accounts' })
  async getBankAccounts(@CurrentUser() user: AuthenticatedUser) {
    return this.earningsService.getBankAccounts(user.id);
  }

  @Post('earnings/withdraw')
  @ApiOperation({ summary: 'Request a withdrawal' })
  async withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: WithdrawDto,
  ) {
    return this.earningsService.requestWithdrawal(user.id, dto.amount, dto.bankAccountId);
  }

  @Get('earnings/payouts')
  @ApiOperation({ summary: 'Get payout history' })
  async getPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.earningsService.getPayoutHistory(user.id);
  }
}
