import Link from 'next/link';
import { 
  FiTrendingUp, 
  FiShield, 
  FiUsers, 
  FiBarChart, 
  FiMapPin, 
  FiSun,
  FiArrowRight,
  FiPlay,
  FiCheck,
  FiShoppingCart,
  FiTarget,
  FiZap,
  FiAward,
  FiHeart,
  FiStar,
  FiTruck,
  FiDollarSign,
  FiCamera,
  FiGlobe
} from 'react-icons/fi';
import { GiPlantSeed } from 'react-icons/gi';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GiPlantSeed className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">AI Farm Commerce</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Features</a>
              <a href="#solutions" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Solutions</a>
              <a href="#marketplace" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Marketplace</a>
              <Link href="/login" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Login</Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-full px-6 py-3 mb-8 shadow-lg">
              <FiZap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">AI-Powered Agriculture Platform</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700 bg-clip-text text-transparent">
                Farm Smarter
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Sell Better
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              Transform your agricultural business with our comprehensive platform. 
              From smart farming to direct marketplace access—everything you need to 
              <span className="font-semibold text-green-700"> maximize profits</span> and 
              <span className="font-semibold text-emerald-700"> grow sustainably</span>.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                href="/register" 
                className="group flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl font-semibold text-lg"
              >
                <span>Start Free Trial</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group flex items-center space-x-3 bg-white/90 backdrop-blur-sm text-gray-700 px-10 py-5 rounded-2xl hover:bg-white transition-all border border-gray-200/50 shadow-lg font-semibold text-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPlay className="w-5 h-5 text-green-600 ml-1" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>
            
            {/* Modern Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">2,500+</div>
                <div className="text-gray-600 font-medium">Active Farmers</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">45%</div>
                <div className="text-gray-600 font-medium">Yield Increase</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">₹2.5L</div>
                <div className="text-gray-600 font-medium">Avg Revenue/Month</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FiShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Marketplace Orders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow smarter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and insights you need to optimize your farming operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FiTrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Get AI-powered insights on crop performance, yield predictions, and optimization recommendations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Real-time monitoring</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Predictive analytics</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FiSun className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Weather Intelligence
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced weather forecasting and alerts to help you make informed decisions about planting, irrigation, and harvesting.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>7-day forecasts</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Weather alerts</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FiMapPin className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Field Management
              </h3>
              <p className="text-gray-600 mb-4">
                Organize and monitor all your fields in one place with detailed tracking of crops, soil health, and growth stages.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Multi-field tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Soil analysis</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <FiBarChart className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Market Intelligence
              </h3>
              <p className="text-gray-600 mb-4">
                Stay informed with real-time market prices, demand forecasts, and the best times to sell your produce.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Live pricing</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Market trends</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <FiShield className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Crop Protection
              </h3>
              <p className="text-gray-600 mb-4">
                AI-powered disease detection and pest management with instant recommendations for treatment and prevention.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Disease detection</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Treatment plans</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <FiUsers className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community & Support
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with experts and fellow farmers, get answers to your questions, and access educational resources.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Expert support</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span>Farmer community</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-green-700 dark:bg-green-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your farming?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-3xl mx-auto">
            Join thousands of farmers who are already using our platform to increase their yields and improve their farming practices.
          </p>
          <Link 
            href="/register" 
            className="px-8 py-4 bg-white text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
              Farmers Assistance
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Empowering farmers with technology and knowledge
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-500 hover:text-green-600 dark:hover:text-green-400">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600 dark:hover:text-green-400">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600 dark:hover:text-green-400">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Farmers Assistance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
