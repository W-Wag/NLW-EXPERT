import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  let speechRecognition: SpeechRecognition | null = null

  function handleUseText() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)
    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content === '') {
      return
    }
    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)
    toast.success('Nota criada com sucesso')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!')
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)
    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm  font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50">
          <Dialog.Content className="z-10 fixed inset-0 md:inset-auto overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
            <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5" />
            </Dialog.Close>

            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm  font-medium text-slate-300">
                  Adicionar Nota
                </span>
                {shouldShowOnboarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{' '}
                    <button
                      className="font-medium text-lime-400 hover:underline"
                      onClick={handleStartRecording}
                      type="button"
                    >
                      gravando uma nota
                    </button>{' '}
                    em áudio ou se preferir utilize{' '}
                    <button
                      onClick={handleUseText}
                      className="font-medium text-lime-400 hover:underline"
                      type="button"
                    >
                      apenas texto
                    </button>
                    .
                  </p>
                ) : (
                  <textarea
                    value={content}
                    autoFocus
                    className="text-sm leading-6 text-slate-400 bg-transparent rezise-none flex-1 outline-none"
                    onChange={handleContentChanged}
                  />
                )}
              </div>

              {isRecording ? (
                <button
                  type="button"
                  className="flex justify-center items-center gap-2 w-full bg-slate-900 py-4 tet-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-950"
                  onClick={handleStopRecording}
                >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  Gravando! (clique p/ interromper)
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full bg-lime-400 py-4 tet-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500
                  disabled:bg-lime-400/50 disabled:cursor-not-allowed"
                  onClick={handleSaveNote}
                  disabled={!content}
                >
                  Salvar Nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
