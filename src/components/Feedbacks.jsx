// components/MyFeedbackDashboard.jsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { 
  FaStar, 
  FaEdit, 
  FaTrash, 
  FaClock, 
  FaMapMarkerAlt,
  FaPlus,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export default function MyFeedback() {
  const { data: session } = useSession()
  const router = useRouter()
  const [myFeedbacks, setMyFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    if (session?.user?.email) {
      fetchMyFeedbacks()
    }
  }, [session])

  const fetchMyFeedbacks = async () => {
    try {
      const response = await fetch(`/api/feedback?email=${session.user.email}`)
      const result = await response.json()
      
      if (result.success) {
        setMyFeedbacks(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch your feedback')
    } finally {
      setLoading(false)
    }
  }

  
const handleDelete = async (feedbackId) => {
  // Show confirmation alert
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This feedback will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10b981", // Emerald green 🟩
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  // If confirmed
  if (result.isConfirmed) {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Show success alert
        await Swal.fire({
          title: "Deleted!",
          text: "Feedback deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
        });

        // Update UI
        setMyFeedbacks((prev) => prev.filter((f) => f._id !== feedbackId));
      } else {
        Swal.fire({
          title: "Failed!",
          text: data.error || "Could not delete feedback.",
          icon: "error",
          confirmButtonColor: "#10b981",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#10b981",
      });
    }
  }
};

  const startEdit = (feedback) => {
    setEditingId(feedback._id)
    setEditFormData({
      rating: feedback.rating,
      feedback: feedback.feedback,
      location: feedback.location || '',
      user_role: feedback.user_role
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const handleEditSubmit = async (feedbackId) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Feedback updated successfully')
        setEditingId(null)
        fetchMyFeedbacks() // Refresh list
      } else {
        toast.error('Failed to update feedback')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update feedback')
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <FaStar
              className={`${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } text-xl`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: myFeedbacks.length,
    avgRating: myFeedbacks.length > 0 
      ? (myFeedbacks.reduce((sum, f) => sum + f.rating, 0) / myFeedbacks.length).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-gray-600">Loading your feedback...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-600 font-semibold">Total Feedback</p>
            <FaChartLine className="text-blue-500 text-xl" />
          </div>
          <p className="text-4xl font-bold text-blue-700">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-600 font-semibold">Average Rating</p>
            <FaStar className="text-yellow-500 text-xl" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-4xl font-bold text-yellow-700">{stats.avgRating}</p>
            <FaStar className="text-yellow-400 text-xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-emerald-600 font-semibold">Quick Action</p>
            <FaPlus className="text-emerald-500 text-xl" />
          </div>
          <button
            onClick={() => router.push('/give-feedback')}
            className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Add New Feedback
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {myFeedbacks.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="mb-4">
            <FaExclamationCircle className="text-gray-400 text-6xl mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Feedback Yet</h3>
          <p className="text-gray-600 mb-6">You haven't submitted any feedback yet.</p>
          <button
            onClick={() => router.push('/feedback/create')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <FaPlus /> Write Your First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myFeedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {editingId === feedback._id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Feedback</h3>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Edit Rating */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rating</label>
                    {renderStars(
                      editFormData.rating, 
                      true, 
                      (rating) => setEditFormData({...editFormData, rating})
                    )}
                  </div>

                  {/* Edit Role */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Role</label>
                    <select
                      value={editFormData.user_role}
                      onChange={(e) => setEditFormData({...editFormData, user_role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Pet Adopter">Pet Adopter</option>
                      <option value="Pet Owner">Pet Owner</option>
                      <option value="Happy Adopter">Happy Adopter</option>
                      <option value="Pet Enthusiast">Pet Enthusiast</option>
                      <option value="Satisfied User">Satisfied User</option>
                    </select>
                  </div>

                  {/* Edit Location */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      placeholder="e.g., Dhaka, Bangladesh"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Edit Feedback */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Feedback</label>
                    <textarea
                      value={editFormData.feedback}
                      onChange={(e) => setEditFormData({...editFormData, feedback: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleEditSubmit(feedback._id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                // View Mode
                <>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name}
                          width={56}
                          height={56}
                          className="rounded-full border-2 border-emerald-200"
                          unoptimized
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {session?.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">{feedback.user_name}</h4>
                        <p className="text-sm text-gray-500">{feedback.user_role}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(feedback)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(feedback._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    {renderStars(feedback.rating)}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaClock />
                      {new Date(feedback.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{feedback.feedback}</p>

                  {/* Location */}
                  {feedback.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      <span>{feedback.location}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}