"use client"

import React, { Component, ReactNode, ErrorInfo } from "react"
import { RotateCcw, AlertCircle } from "lucide-react"

interface SectionErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
  onReset?: () => void
}

interface SectionErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log safe error telemetry without exposing sensitive data
    if (process.env.NODE_ENV !== "production") {
      console.error("SectionErrorBoundary caught an error:", error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="polite"
          className="p-6 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] text-center space-y-3 my-4"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E5E5E5] text-[#555555]">
            <AlertCircle className="w-4 h-4 text-[#111111]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#111111]">
              {this.props.fallbackTitle || "This section couldn't load."}
            </h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              {this.props.fallbackDescription ||
                "Something interrupted this part of AIMETRA. You can retry loading this component without refreshing the page."}
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
