import React, { useState, useEffect, useRef } from 'react';
import {
    Video, Mic, CheckCircle2, AlertCircle, Play, RotateCcw,
    Send, Sparkles, Award, FileText, ChevronRight, Download,
    ShieldCheck, HelpCircle, Clock, Volume2, ArrowRight
} from 'lucide-react';

const SAMPLE_QUESTION = {
    id: 3,
    totalQuestions: 8,
    text: "Ceritakan pengalaman Anda ketika menghadapi masalah besar dalam sebuah project dan bagaimana Anda menyelesaikannya bersama tim.",
    context: "Pertanyaan ini bertujuan untuk menilai kemampuan problem solving, kepemimpinan teknis, serta komunikasi Anda dalam kondisi krisis.",
    prepTimeSeconds: 45,
    maxRecordTimeSeconds: 90,
    rubric: [
        { criterion: "Problem Identification", weight: 25, maxScore: 25, description: "Kejelasan mengidentifikasi dan menguraikan akar masalah utama." },
        { criterion: "Action Taken", weight: 30, maxScore: 30, description: "Langkah-langkah konkret dan teknis yang diambil untuk menyelesaikan masalah." },
        { criterion: "Communication", weight: 20, maxScore: 20, description: "Struktur penyampaian yang jelas, runut, dan tidak berbelit-belit." },
        { criterion: "Result", weight: 15, maxScore: 15, description: "Hasil akhir atau dampak terukur yang berhasil dicapai setelah tindakan diambil." },
        { criterion: "Reflection", weight: 10, maxScore: 10, description: "Pelajaran atau komitmen perbaikan yang dipetik untuk masa depan." }
    ]
};

export default function AssessmentSession() {
    const [step, setStep] = useState('system-check');
    const [prepTimer, setPrepTimer] = useState(SAMPLE_QUESTION.prepTimeSeconds);
    const [recordTimer, setRecordTimer] = useState(0);

    // Media states
    const [stream, setStream] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [micLevel, setMicLevel] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const liveVideoRef = useRef(null);
    const audioContextRef = useRef(null);

    // 1. Initial System Check - Setup Camera & Audio Level Meter
    useEffect(() => {
        let animationFrameId = null; // Fix: Diinisialisasi agar tidak implicit any

        const initMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });
                setStream(mediaStream);

                // Audio Level Detection untuk UX feedback
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioCtx();
                audioContextRef.current = audioContext;
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(mediaStream);
                source.connect(analyser);
                analyser.fftSize = 64;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateMicLevel = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
                    animationFrameId = requestAnimationFrame(updateMicLevel);
                };
                updateMicLevel();
            } catch (err) {
                console.error("Akses kamera/mikrofon ditolak:", err);
            }
        };

        if (step === 'system-check' || step === 'prep' || step === 'recording') {
            initMedia();
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [step]);

    // Connect video stream to HTML video element
    useEffect(() => {
        if (liveVideoRef.current && stream && (step === 'system-check' || step === 'prep' || step === 'recording')) {
            liveVideoRef.current.srcObject = stream;
        }
    }, [stream, step]);

    // Preparation Timer
    useEffect(() => {
        let timer;
        if (step === 'prep' && prepTimer > 0) {
            timer = setInterval(() => setPrepTimer((prev) => prev - 1), 1000);
        } else if (step === 'prep' && prepTimer === 0) {
            startRecording();
        }
        return () => clearInterval(timer);
    }, [step, prepTimer]);

    // Recording Timer
    useEffect(() => {
        let timer;
        if (step === 'recording') {
            timer = setInterval(() => {
                setRecordTimer((prev) => {
                    if (prev >= SAMPLE_QUESTION.maxRecordTimeSeconds - 1) {
                        stopRecording();
                        return SAMPLE_QUESTION.maxRecordTimeSeconds;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step]);

    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedBlob(blob);
            setVideoUrl(url);
            stopCameraStream();
        };

        recorder.start();
        setStep('recording');
        setRecordTimer(0);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setStep('review');
    };

    const stopCameraStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const handleReRecord = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setRecordedBlob(null);
        setVideoUrl(null);
        setPrepTimer(SAMPLE_QUESTION.prepTimeSeconds);
        setStep('prep');
    };

    const handleSimulateSubmit = () => {
        setStep('analyzing');
        setTimeout(() => {
            setStep('results');
        }, 3000);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className='flex h-dvh overflow-hidden'>
            <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-y-auto outline-none">

                {/* APP HEADER */}
                <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                                V
                            </div>
                            <div>
                                <h1 className="font-semibold text-sm text-slate-100 leading-none">Asynchronous Assessment Engine</h1>
                                <p className="text-xs text-slate-400 mt-1">Role: Senior Frontend Engineer</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Question {SAMPLE_QUESTION.id} of {SAMPLE_QUESTION.totalQuestions}</span>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTAINER */}
                <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center">

                    {/* STEP 1: SYSTEM CHECK */}
                    {step === 'system-check' && (
                        <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl">
                            <div className="mx-auto text-center space-y-6">
                                <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-2">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">System & Device Readiness</h2>
                                    <p className="text-sm text-slate-400 mt-1">Pastikan kamera dan mikrofon berfungsi dengan baik sebelum memulai sesi asesmen.</p>
                                </div>

                                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                                    <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur px-3 py-2 rounded-lg text-xs">
                                        <div className="flex items-center space-x-2 text-emerald-400">
                                            <Video className="w-4 h-4" />
                                            <span>Camera Active</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-slate-300">
                                            <Volume2 className="w-4 h-4 text-slate-400" />
                                            <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-400 h-full transition-all duration-75" style={{ width: `${micLevel}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep('prep')}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25"
                                >
                                    <span>Mulai Sesi Asesmen</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PREPARATION PHASE */}
                    {step === 'prep' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 backdrop-blur space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                                        Question Stage
                                    </span>
                                    <div className="flex items-center space-x-2 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-medium">
                                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                        <span>Prep Time: {formatTime(prepTimer)}</span>
                                    </div>
                                </div>
                                <h2 className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                                    "{SAMPLE_QUESTION.text}"
                                </h2>
                                <p className="text-xs text-slate-400">{SAMPLE_QUESTION.context}</p>
                            </div>

                            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                                <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                                    Camera Preview
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col items-center">
                                    <button
                                        onClick={startRecording}
                                        className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-xl shadow-blue-600/30 flex items-center space-x-2"
                                    >
                                        <Video className="w-4 h-4" />
                                        <span>Start Recording Now</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: RECORDING PHASE */}
                    {step === 'recording' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4 backdrop-blur flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Recording Live</span>
                                </div>
                                <div className="text-lg font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
                                    {formatTime(recordTimer)} / {formatTime(SAMPLE_QUESTION.maxRecordTimeSeconds)}
                                </div>
                            </div>

                            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl shadow-red-950/20">
                                <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex justify-center">
                                    <button
                                        onClick={stopRecording}
                                        className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition shadow-xl shadow-red-600/30 flex items-center space-x-2"
                                    >
                                        <div className="w-3 h-3 bg-white rounded-sm" />
                                        <span>Stop Recording</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW & SUBMIT */}
                    {step === 'review' && videoUrl && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 backdrop-blur space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-white">Review Your Response</h2>
                                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-md">
                                        Duration: {formatTime(recordTimer)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Tinjau ulang hasil rekaman Anda sebelum dikirimkan ke sistem evaluasi AI.
                                </p>

                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shadow-xl">
                                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        onClick={handleReRecord}
                                        className="flex-1 py-3 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition flex items-center justify-center space-x-2 border border-slate-600/50"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Re-record Answer</span>
                                    </button>
                                    <button
                                        onClick={handleSimulateSubmit}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Submit Answer for AI Assessment</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: AI ANALYZING SPINNER */}
                    {step === 'analyzing' && (
                        <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-12 backdrop-blur text-center space-y-6 my-auto">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                                <div className="relative w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Analyzing Response against Rubric...</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Sistem sedang melakukan Speech-to-Text transkripsi dan mengevaluasi jawaban Anda secara objektif berdasarkan indikator kompetensi.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: RESULTS & DEFENSIBLE ASSESSMENT REPORT */}
                    {step === 'results' && (
                        <div className="space-y-6 my-4">
                            {/* Header Score Card */}
                            <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-slate-700/80 rounded-2xl p-6 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                                <div>
                                    <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Rubric-Based Evaluation Complete</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">AI Answer Assessment Report</h2>
                                    <p className="text-xs text-slate-400 mt-1">Penilaian objektif berbasis bukti transkrip ucapan (Evidence-Based Scoring)</p>
                                </div>
                                <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl text-center min-w-[140px]">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Overall Score</span>
                                    <span className="text-3xl font-extrabold text-blue-400">82 <span className="text-sm font-normal text-slate-500">/ 100</span></span>
                                </div>
                            </div>

                            {/* Criteria Scores Grid */}
                            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 backdrop-blur space-y-4">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                                    <Award className="w-4 h-4 text-blue-400" />
                                    <span>Competency Breakdown</span>
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        { criterion: "Problem Identification", score: 20, max: 25, desc: "Menjelaskan konteks insiden downtime dengan spesifik." },
                                        { criterion: "Action Taken", score: 27, max: 30, desc: "Rincian pembagian tim rollback dan investigasi log sangat jelas." },
                                        { criterion: "Communication", score: 16, max: 20, desc: "Penyampaian terstruktur menggunakan kerangka kronologis." },
                                        { criterion: "Result", score: 11, max: 15, desc: "Menyebutkan durasi recovery 45 menit tanpa dampaknya pada SLA." },
                                        { criterion: "Reflection", score: 8, max: 10, desc: "Refleksi singkat mengenai perbaikan otomatisasi deployment." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-200">{item.criterion}</span>
                                                <span className="font-mono font-semibold text-slate-300">{item.score} / {item.max}</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(item.score / item.max) * 100}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-400">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths & Areas to Improve */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 backdrop-blur space-y-3">
                                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Strengths</span>
                                    </h4>
                                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                                        <li>Menjelaskan akar masalah teknis secara eksplisit tanpa menyalahkan pihak lain.</li>
                                        <li>Menggambarkan koordinasi dan pembagian peran tim secara taktis.</li>
                                        <li>Menyebutkan hasil pemulihan sistem yang dapat diukur.</li>
                                    </ul>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 backdrop-blur space-y-3">
                                    <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Areas to Improve</span>
                                    </h4>
                                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                                        <li>Dapat mengelaborasi estimasi dampak finansial atau kerugian pengguna akibat masalah.</li>
                                        <li>Bagian refleksi pencegahan jangka panjang dapat diperdalam.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Evidence Quotes */}
                            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 backdrop-blur space-y-3">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span>Transcript Evidence Quotes</span>
                                </h3>
                                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300 italic">
                                    <p className="border-l-2 border-blue-500 pl-3">
                                        "Kami membagi tim menjadi dua: satu fokus melakukan rollback ke versi stabil terakhir, dan satu lagi melakukan audit log pada database untuk mencari query pembuka kebocoran..."
                                    </p>
                                    <p className="border-l-2 border-emerald-500 pl-3">
                                        "Hasilnya, layanan kembali normal dalam kurun waktu 45 menit tanpa ada kehilangan data transaksi pengguna."
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setStep('system-check');
                                    setRecordedBlob(null);
                                    setVideoUrl(null);
                                }}
                                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition border border-slate-700 flex items-center justify-center space-x-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Simulasi Ulang Soal Berikutnya</span>
                            </button>
                        </div>
                    )}

                </main>
            </main>
        </div>
    );
}