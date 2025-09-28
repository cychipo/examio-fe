import { PricingTable } from '../molecules/PricingTable';

const features = [
	{ name: 'Truy cập thư viện công cụ cơ bản', included: 'starter' },
	{ name: 'Tham gia tối đa 5 thành viên', included: 'starter' },
	{ name: 'Hỗ trợ cơ bản qua email', included: 'starter' },

	{ name: 'Thư viện công cụ mở rộng & nâng cao', included: 'pro' },
	{ name: 'Tham gia tối đa 20 thành viên', included: 'pro' },
	{ name: 'Hỗ trợ ưu tiên (email + chat)', included: 'pro' },

	{ name: 'Tích hợp tùy chỉnh theo nhu cầu', included: 'all' },
	{ name: 'Không giới hạn số thành viên', included: 'all' },
	{ name: 'Hỗ trợ 24/7 (email + chat + hotline)', included: 'all' },
];

const plans = [
	{
		name: 'Cơ bản',
		price: { monthly: 150_000, yearly: 1_440_000 },
		level: 'starter',
	},
	{
		name: 'Chuyên nghiệp',
		price: { monthly: 490_000, yearly: 4_700_000 },
		level: 'pro',
		popular: true,
	},
	{
		name: 'Doanh nghiệp',
		price: { monthly: 990_000, yearly: 9_900_000 },
		level: 'all',
	},
];

export default function PricingSection() {
	return (
		<PricingTable
			features={features}
			plans={plans}
			defaultPlan="pro"
			defaultInterval="monthly"
			onPlanSelect={(plan) => console.log('Selected plan:', plan)}
			containerClassName="py-12"
			buttonClassName="bg-primary hover:bg-primary/90"
		/>
	);
}
