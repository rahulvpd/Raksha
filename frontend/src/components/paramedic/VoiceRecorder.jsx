import { useState, useRef } from 'react'
import axios from 'axios'

export default function VoiceRecorder({ onResult }) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    setError(null); setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await sendToSarvam(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRef.current = recorder
      setRecording(true)
    } catch (e) {
      setError('Microphone access denied. Please allow microphone.')
    }
  }

  const stopRecording = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop()
      setRecording(false)
      setLoading(true)
    }
  }

  const sendToSarvam = async (blob) => {
    try {
      const form = new FormData()
      form.append('file', blob, 'voice.webm')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/voice/transcribe`,
        form, { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setResult(res.data)
      if (onResult) onResult(res.data)
    } catch (e) {
      setError('Voice transcription failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px' }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🎙️ Tamil Voice Report — Sarvam AI
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginBottom: '14px', lineHeight: '1.5' }}>
        Speak in Tamil — say the blood group and situation.<br />
        Example: <span style={{ color: '#aaa', fontStyle: 'italic' }}>"பி பாசிட்டிவ் ரத்தம் தேவை, விபத்து நடந்துள்ளது"</span>
      </p>

      {/* Record button */}
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          background: recording ? '#CC0000' : '#1a1a1a',
          border: `2px solid ${recording ? '#CC0000' : '#2a2a2a'}`,
          color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          transition: 'all 0.2s',
          animation: recording ? 'pulse 1s ease-in-out infinite' : 'none'
        }}
      >
        {loading ? '⏳ Transcribing...' : recording ? '⏹ Stop Recording' : '🎙️ Start Tamil Voice Input'}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '12px' }}>
          {result.transcript && (
            <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Tamil Transcript</div>
              <div style={{ fontSize: '13px', color: '#ddd' }}>{result.transcript}</div>
            </div>
          )}
          {result.translation && (
            <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>English Translation</div>
              <div style={{ fontSize: '13px', color: '#ddd' }}>{result.translation}</div>
            </div>
          )}
          {result.blood_group_detected && (
            <div style={{
              background: '#CC000022', border: '1px solid #CC000033',
              borderRadius: '8px', padding: '10px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Blood Group Detected</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#CC0000' }}>{result.blood_group_detected}</div>
            </div>
          )}
        </div>
      )}

      {error && <div style={{ color: '#CC0000', fontSize: '12px', marginTop: '10px' }}>{error}</div>}
    </div>
  )
}
