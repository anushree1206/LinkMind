"use client"

import React from "react"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error?: any
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Analytics ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-4 border border-destructive/30 rounded-md bg-destructive/5 text-destructive">
          <p className="font-medium">Something went wrong rendering this section.</p>
          <p className="text-sm opacity-80">Please try again or refresh the page.</p>
        </div>
      )
    }
    return this.props.children
  }
}


