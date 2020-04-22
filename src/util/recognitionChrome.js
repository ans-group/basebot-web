// shim Chrome recognition API
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognizer = Recognition && new Recognition()
const recognitionSupport = !!Recognition

/**
 * detectVoice
 *
 * @returns {Promise}
 */
const detectVoice = () => new Promise((resolve, reject) => {
  recognizer.onresult = ({ results }) => resolve(results[0][0].transcript)
  recognizer.onerror = ({ error }) => reject(error)
})

const startRecognition = () => recognizer.start()
const stopRecognition = () => recognizer.stop()

export {
  recognitionSupport,
  startRecognition,
  stopRecognition,
  detectVoice
}
