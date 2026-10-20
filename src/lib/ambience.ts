// Rain ambience synthesized with Web Audio: filtered noise, no audio files. Off until the visitor turns it on.
let ctx: AudioContext | null = null
let gain: GainNode | null = null

export function setRain(on: boolean) {
  if (on && !ctx) {
    ctx = new AudioContext()
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 1400
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 300
    gain = ctx.createGain()
    gain.gain.value = 0
    src.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination)
    src.start()
  }
  if (!ctx || !gain) return
  if (on) ctx.resume()
  gain.gain.setTargetAtTime(on ? 0.08 : 0, ctx.currentTime, 0.4)
}
