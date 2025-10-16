// app/feedback/success/page.jsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCheckCircle, FaStar, FaHome, FaList, FaHeart } from 'react-icons/fa'
import { IoMdPaw } from "react-icons/io";
import confetti from 'canvas-confetti'
import { GiPartyPopper } from 'react-icons/gi'
import { TiStarFullOutline } from "react-icons/ti";

export default function FeedbackSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }
const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // ⏳ Countdown
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [])

  // 🚀 Redirect after countdown ends
  useEffect(() => {
    if (countdown === 0) {
      router.push('/')
    }
  }, [countdown, router])


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transform animate-bounce-in">

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex gap-2 items-center justify-center">
            Thank You! <GiPartyPopper className='text-emerald-600' size={50} />
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your feedback has been submitted successfully!
          </p>
          <p className="text-gray-500 mb-8">
            Your feedback helps us improve our service. We really appreciate you taking the time to share your experience with us.
          </p>

          {/* Fun Facts */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 flex flex-col justify-center items-center">
                <IoMdPaw className='text-orange-500' size={35}/>
              <p className="text-sm text-gray-600">Happy Pets</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 flex flex-col justify-center items-center"><FaHeart className='text-red-600' size={30}/>
              <p className="text-sm text-gray-600">Loving Homes</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 flex flex-col justify-center items-center">
              <TiStarFullOutline size={40} className='text-yellow-500'/>
              <p className="text-sm text-gray-600">Amazing Reviews</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              <FaHome /> Back to Home
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-full transition-all border-2 border-gray-200 transform hover:scale-105"
            >
              <FaList /> View All Feedback
            </button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="text-sm text-gray-500">
            <p>Redirecting to home in <span className="font-bold text-emerald-600">{countdown}</span> seconds...</p>
          </div>
        </div>

        {/* Additional Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Want to help more? Consider{' '}
            <a href="/adopt" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
              adopting a pet
            </a>
            {' '}today!
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }
      `}</style>
    </div>
  )
}