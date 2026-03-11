const TermsOfService = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-start py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="text-gray-300 leading-relaxed space-y-6">
          <p>
            Welcome to MHD Store. By accessing or using our website, you agree to be bound by these Terms of
            Service.
          </p>
          <h2 className="text-2xl font-semibold text-white">1. Use of Our Services</h2>
          <p>
            You may use our services only as permitted by law. We may suspend or stop providing our services to you
            if you do not comply with our terms or policies.
          </p>
          <h2 className="text-2xl font-semibold text-white">2. Privacy</h2>
          <p>
            Our Privacy Policy explains how we treat your personal data. By using our services, you agree that we
            can use such data in accordance with our Privacy Policy.
          </p>
          <h2 className="text-2xl font-semibold text-white">3. Copyright</h2>
          <p>
            All content on this website, including text, graphics, logos, and images, is the property of
            MHD Store and is protected by international copyright laws.
          </p>
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;
