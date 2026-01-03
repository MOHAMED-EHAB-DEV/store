const PrivacyPolicy = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-start py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="text-gray-300 leading-relaxed space-y-6">
          <p>
            MHD-Store is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
            and share your personal information.
          </p>
          <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p>
            We may collect personal information from you, such as your name, email address, and payment information,
            when you use our services.
          </p>
          <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>
            We use your personal information to provide and improve our services, to process your payments, and to
            communicate with you.
          </p>
          <h2 className="text-2xl font-semibold text-white">3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except as necessary to provide our
            services or as required by law.
          </p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
