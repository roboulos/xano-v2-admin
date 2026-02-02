/**
 * Mermaid CDN Singleton Loader
 * Ensures Mermaid script loads exactly once regardless of component mount count
 * Prevents race conditions and duplicate script tags
 */

type LoadState = 'idle' | 'pending' | 'loaded' | 'failed'

interface MermaidLoaderState {
  state: LoadState
  callbacks: Array<(success: boolean) => void>
}

const loaderState: MermaidLoaderState = {
  state: 'idle',
  callbacks: [],
}

/**
 * Load Mermaid from CDN
 * Returns a Promise that resolves when Mermaid is ready
 * Multiple calls queue their callbacks to ensure single script load
 */
export async function loadMermaid(): Promise<boolean> {
  return new Promise((resolve) => {
    if (loaderState.state === 'loaded') {
      resolve(true)
      return
    }

    if (loaderState.state === 'failed') {
      resolve(false)
      return
    }

    // Queue callback for pending/idle states
    loaderState.callbacks.push(resolve)

    // If already pending, callbacks will be resolved when load completes
    if (loaderState.state === 'pending') {
      return
    }

    // Start loading
    loaderState.state = 'pending'

    // Create script tag
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.async = true

    const onLoad = () => {
      loaderState.state = 'loaded'
      cleanup()
      // Resolve all queued callbacks
      const callbacks = loaderState.callbacks.splice(0)
      callbacks.forEach((cb) => cb(true))
    }

    const onError = () => {
      loaderState.state = 'failed'
      cleanup()
      // Reject all queued callbacks
      const callbacks = loaderState.callbacks.splice(0)
      callbacks.forEach((cb) => cb(false))
    }

    const cleanup = () => {
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
    }

    script.addEventListener('load', onLoad)
    script.addEventListener('error', onError)

    // Check if script already in DOM (safety check)
    if (!document.querySelector('script[src*="mermaid"]')) {
      document.head.appendChild(script)
    } else {
      // Script already exists, mark as loaded
      loaderState.state = 'loaded'
      cleanup()
      const callbacks = loaderState.callbacks.splice(0)
      callbacks.forEach((cb) => cb(true))
    }
  })
}

/**
 * Render a Mermaid diagram after ensuring Mermaid is loaded
 * @param elementId - ID of the element to render diagram in
 * @param definition - Mermaid diagram definition (DSL)
 * @returns Promise that resolves when rendering is complete
 */
export async function renderMermaidDiagram(
  elementId: string,
  definition: string
): Promise<boolean> {
  try {
    const success = await loadMermaid()
    if (!success) {
      console.error('Failed to load Mermaid library')
      return false
    }

    // Access Mermaid from window
    const mermaidWindow = window as unknown as {
      mermaid?: {
        contentLoaded: () => void
        renderAsync?: (id: string, definition: string) => Promise<void>
      }
    }

    if (!mermaidWindow.mermaid) {
      console.error('Mermaid not available on window')
      return false
    }

    // Trigger Mermaid rendering
    if (mermaidWindow.mermaid.renderAsync) {
      await mermaidWindow.mermaid.renderAsync(elementId, definition)
    } else {
      mermaidWindow.mermaid.contentLoaded()
    }

    return true
  } catch (error) {
    console.error('Error rendering Mermaid diagram:', error)
    return false
  }
}

/**
 * Reset loader state (useful for testing or manual refresh)
 */
export function resetMermaidLoader(): void {
  loaderState.state = 'idle'
  loaderState.callbacks = []
}
