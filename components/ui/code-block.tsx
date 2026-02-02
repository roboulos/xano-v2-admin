'use client'

/**
 * Code Block Component
 * Syntax-highlighted code display with copy button
 */

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './button'

export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  copyable?: boolean
  lineNumbers?: boolean
  maxHeight?: string
  className?: string
}

export function CodeBlock({
  code,
  language = 'text',
  title,
  copyable = true,
  lineNumbers = true,
  maxHeight = '400px',
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple syntax highlighting for common languages
  const highlightedCode = highlightSyntax(code, language)

  const lines = code.split('\n')

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(title || copyable) && (
        <div className="flex items-center justify-between gap-2">
          {title && <h4 className="font-mono text-sm font-semibold">{title}</h4>}
          {copyable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}

      {/* Code container */}
      <div
        className="overflow-auto border rounded-lg bg-slate-950 text-slate-50"
        style={{ maxHeight }}
      >
        <pre className="p-4">
          <code className={`text-sm font-mono language-${language}`}>
            {lines.map((line, idx) => (
              <div key={idx} className="flex gap-4">
                {lineNumbers && (
                  <span className="inline-block w-8 text-right text-slate-600 select-none">
                    {idx + 1}
                  </span>
                )}
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode.split('\n')[idx] || line,
                  }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

// ============================================================================
// SYNTAX HIGHLIGHTING WITH XSS PROTECTION
// ============================================================================

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

function highlightSyntax(code: string, language: string): string {
  // First escape all HTML special characters to prevent XSS
  const escaped = escapeHtml(code)

  const languagePatterns: Record<string, Array<[RegExp, string]>> = {
    typescript: [
      [
        /\b(const|let|var|function|async|await|interface|type|class)\b/g,
        '<span class="text-blue-400">$1</span>',
      ],
      [/\b(true|false|null|undefined)\b/g, '<span class="text-green-400">$1</span>'],
      [/&quot;([^&]*)&quot;/g, '<span class="text-amber-300">&quot;$1&quot;</span>'],
      [/&#039;([^&]*)&#039;/g, '<span class="text-amber-300">&#039;$1&#039;</span>'],
      [/\/\/.*/g, '<span class="text-slate-500">$&</span>'],
      [/\/\*[\s\S]*?\*\//g, '<span class="text-slate-500">$&</span>'],
    ],
    json: [
      [/&quot;([^&]*)&quot;:/g, '<span class="text-blue-400">&quot;$1&quot;</span>:'],
      [/:\s*&quot;([^&]*)&quot;/g, ': <span class="text-amber-300">&quot;$1&quot;</span>'],
      [/:\s*(true|false|null)/g, ': <span class="text-green-400">$1</span>'],
      [/:\s*(\d+)/g, ': <span class="text-green-400">$1</span>'],
    ],
    javascript: [
      [/\b(const|let|var|function|async|await|class)\b/g, '<span class="text-blue-400">$1</span>'],
      [/\b(true|false|null|undefined)\b/g, '<span class="text-green-400">$1</span>'],
      [/&quot;([^&]*)&quot;/g, '<span class="text-amber-300">&quot;$1&quot;</span>'],
      [/&#039;([^&]*)&#039;/g, '<span class="text-amber-300">&#039;$1&#039;</span>'],
      [/\/\/.*/g, '<span class="text-slate-500">$&</span>'],
    ],
    bash: [
      [/^(\$|\#).*/g, '<span class="text-green-400">$&</span>'],
      [
        /\b(if|then|else|fi|for|while|do|done|function)\b/g,
        '<span class="text-blue-400">$1</span>',
      ],
      [/&quot;([^&]*)&quot;/g, '<span class="text-amber-300">&quot;$1&quot;</span>'],
      [/&#039;([^&]*)&#039;/g, '<span class="text-amber-300">&#039;$1&#039;</span>'],
    ],
    sql: [
      [
        /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|LIMIT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE)\b/gi,
        '<span class="text-blue-400">$1</span>',
      ],
      [/\b(AND|OR|NOT|IN|EXISTS|BETWEEN)\b/gi, '<span class="text-green-400">$1</span>'],
      [/&#039;([^&]*)&#039;/g, '<span class="text-amber-300">&#039;$1&#039;</span>'],
    ],
  }

  let highlighted = escaped
  const patterns = languagePatterns[language] || []

  for (const [pattern, replacement] of patterns) {
    highlighted = highlighted.replace(pattern, replacement)
  }

  return highlighted
}

// Export for standalone use
export default CodeBlock
