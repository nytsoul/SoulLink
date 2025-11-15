'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Camera, Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VerificationPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [consentGranted, setConsentGranted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      checkConsent()
      fetchVerification()
    }
  }, [user])

  const checkConsent = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/verification/consent`)
      const faceConsent = response.data.consents?.find(
        (c: any) => c.consentType === 'face-verification' && c.granted && !c.revokedAt
      )
      setConsentGranted(!!faceConsent)
    } catch (error) {
      console.error('Failed to check consent:', error)
    }
  }

  const fetchVerification = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/verification/face`)
      setVerification(response.data.verification)
    } catch (error) {
      console.error('Failed to fetch verification:', error)
    }
  }

  const grantConsent = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/verification/consent`, {
        consentType: 'face-verification',
        granted: true,
      })
      setConsentGranted(true)
      toast.success('Consent granted')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grant consent')
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      toast.error('Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
            handleVerification(file)
          }
        }, 'image/jpeg')
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleVerification(file)
    }
  }

  const handleVerification = async (file: File) => {
    if (!consentGranted) {
      toast.error('Please grant consent first')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('selfie', file)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verification/face/request`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      setVerification(response.data.verification)
      stopCamera()
      toast.success(response.data.message || 'Verification submitted')
      fetchVerification()
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Please grant consent first')
        setConsentGranted(false)
      } else {
        toast.error(error.response?.data?.message || 'Verification failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-pink-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Face Verification</h1>
        </div>

        {!consentGranted ? (
          <div className="text-center py-12 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Consent Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Face verification requires your explicit consent. We use this to verify your identity
              and ensure account security. Your biometric data is encrypted and stored securely.
            </p>
            <button
              onClick={grantConsent}
              className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold"
            >
              Grant Consent
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {verification?.result === 'PASS' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-2 border-green-200 dark:border-green-800 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Verified!</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your face verification was successful
                  </p>
                </div>
              </div>
            )}

            {verification?.result === 'FAIL' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-2 border-red-200 dark:border-red-800 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Verification Failed</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">Please try again</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Take Selfie</h3>
                {!stream ? (
                  <button
                    onClick={startCamera}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 flex flex-col items-center justify-center gap-2"
                  >
                    <Camera className="w-12 h-12 text-gray-400" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border-2 border-gray-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={capturePhoto}
                        disabled={loading}
                        className="flex-1 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Capture & Verify'}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-4">Or Upload Photo</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="block w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 cursor-pointer text-center"
                >
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <span>Upload Selfie</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

