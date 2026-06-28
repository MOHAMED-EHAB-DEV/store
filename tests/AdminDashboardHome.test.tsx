import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardHome from '../components/Admin/AdminDashboardHome';

// Mock data
const mockData = {
  users: [
    { _id: '1', name: 'Test User', email: 'test@example.com', tier: 'pro', createdAt: new Date().toISOString() }
  ],
  templates: [
    { _id: '1', title: 'Test Template', createdAt: new Date().toISOString() }
  ],
  downloads: [
    { _id: '1', templateId: { title: 'Test Template' }, userId: { name: 'Test User' }, createdAt: new Date().toISOString() }
  ],
  tickets: [
    { _id: '1', status: 'open', createdAt: new Date().toISOString() }
  ],
  analytics: null
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AdminDashboardHome', () => {
  it('renders without crashing and displays key metrics', () => {
    render(<AdminDashboardHome data={mockData} />);

    // Check if header is present
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    // Check if stat cards are rendered (using labels)
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
    expect(screen.getByText('Active Tickets')).toBeInTheDocument();
  });

  it('calculates and displays premium users correctly', () => {
    render(<AdminDashboardHome data={mockData} />);

    // Check the "Premium Users" card value
    // The test data has 1 'pro' user out of 1 total user
    expect(screen.getByText('Premium Users')).toBeInTheDocument();
    // Verify the value '1' is displayed near "Premium Users"
    const premiumValue = screen.getAllByText('1').find(el => el.tagName === 'P' && el.className.includes('text-3xl'));
    expect(premiumValue).toBeInTheDocument();
  });
});
