
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, Zap, ArrowRight, Sparkles, Star, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/40 to-pink-200/40 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-20">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-24 max-w-5xl mx-auto">
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-110">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 animate-bounce">
                  <Sparkles className="w-7 h-7 text-yellow-400" />
                </div>
                <div className="absolute -bottom-3 -left-3 animate-pulse">
                  <Star className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
                Chat<span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">App</span>
              </h1>
              <div className="flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </div>
            </div>
            
            <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-200 mb-6 font-light leading-relaxed">
              Connect instantly with friends and family
            </p>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience seamless, secure, and lightning-fast messaging with enterprise-grade security. 
              Simple conversations, powerful connections that bring people together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button asChild size="lg" className="text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                <Link to="/login" className="flex items-center gap-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-7 rounded-2xl border-2 hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg hover:bg-white/80 dark:hover:bg-slate-700/80">
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>5-Star Rated</span>
              </div>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-24">
            <Card className="group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="pt-10 pb-10 px-8 text-center relative">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Instant Messaging</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  Send and receive messages in real-time with our lightning-fast delivery system powered by cutting-edge technology.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="pt-10 pb-10 px-8 text-center relative">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Find Friends</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  Easily search and connect with users by username to start meaningful conversations and build lasting relationships.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="pt-10 pb-10 px-8 text-center relative">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Secure & Fast</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  Enterprise-grade security with blazing-fast performance for your complete peace of mind and seamless experience.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced CTA Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl"></div>
            <div className="relative text-center bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-xl rounded-3xl p-16 max-w-5xl mx-auto border border-white/20 dark:border-slate-600/20 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Ready to revolutionize your conversations?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of users already connecting on ChatApp and experience the future of messaging today
                </p>
              </div>
              <Button asChild size="lg" className="text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                <Link to="/signup" className="flex items-center gap-3">
                  Start Chatting Now
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
