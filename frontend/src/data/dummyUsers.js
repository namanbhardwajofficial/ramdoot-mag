const dummyUsers = [
  {
    id: 'user_2130403',
    name: 'Atharv Kelwadkar',
    email: 'atharv.kelwadkar@example.com',
    phone: '+91 9876543210',
    location: 'Pune, Maharashtra',
    magazines:[{name:'ram',id:'123',status:'live',publishedOn:'12/09/2003',purchasedOn:'12/09/2003', reads: 12500},{name:'ram',id:'123',status:'live',publishedOn:'12/09/2003',purchasedOn:'12/09/2003'},{name:'ram',id:'123',status:'live',publishedOn:'12/09/2003',purchasedOn:'12/09/2003'},{name:'ram',id:'123',status:'live',publishedOn:'12/09/2003',purchasedOn:'12/09/2003'}],

    status: 'Active',
    subscription: 'Paid',
    subscriptionPlan: 'Monthly ₹449',
    amount: '₹449',
    paymentMethod: 'UPI',

    lastActive: '2 days ago',
    totalSpent: 3294,
    joinedOn: '2020-10-17',
  },
  {
    id: 'user_2130404',
    name: 'Riya Sharma',
    email: 'riya.sharma@example.com',
    phone: '+91 9876543211',
    location: 'Delhi, India',

    status: 'Suspended',
    subscription: 'Free',
    subscriptionPlan: 'Basic Plan',
    amount: '₹0',
    paymentMethod: '-',

    lastActive: '12 days ago',
    totalSpent: 1000,
    joinedOn: '2020-10-22',
  },
  {
    id: 'user_2130405',
    name: 'Karan Mehta',
    email: 'karan.mehta@example.com',
    phone: '+91 9876543212',
    location: 'Mumbai, Maharashtra',

    status: 'Blocked',
    subscription: 'Paid',
    subscriptionPlan: 'Yearly ₹3999',
    amount: '₹3999',
    paymentMethod: 'Credit Card',

    lastActive: '92 days ago',
    totalSpent: 2000,
    joinedOn: '2020-02-01',
  },
  {
    id: 'user_2130406',
    name: 'Sneha Verma',
    email: 'sneha.verma@example.com',
    phone: '+91 9876543213',
    location: 'Bengaluru, Karnataka',

    status: 'Active',
    subscription: 'Paid',
    subscriptionPlan: 'Monthly ₹449',
    amount: '₹449',
    paymentMethod: 'Debit Card',

    lastActive: '1 day ago',
    totalSpent: 2000,
    joinedOn: '2020-09-06',
  },
  {
    id: 'user_2130408',
    name: 'Meera Joshi',
    email: 'meera.joshi@example.com',
    phone: '+91 9876543214',
    location: 'Ahmedabad, Gujarat',

    status: 'Active',
    subscription: 'Paid',
    subscriptionPlan: 'Quarterly ₹1199',
    amount: '₹1199',
    paymentMethod: 'Net Banking',

    lastActive: '12 days ago',
    totalSpent: 1000,
    joinedOn: '2020-05-24',
  },
];
export default dummyUsers;