'use client'

import { useRef, useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

interface ImageDialogProps {
  src: string | null
  alt?: string
  children: React.ReactNode
}

export function ImageDialog({ src, alt = 'Foto', children }: ImageDialogProps) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM))
  const zoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM))
  const resetZoom = () => setZoom(1)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 || !containerRef.current) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - dx
    containerRef.current.scrollTop = dragStart.current.scrollTop - dy
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || !containerRef.current) return
    const touch = e.touches[0]
    setIsDragging(true)
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const dx = touch.clientX - dragStart.current.x
    const dy = touch.clientY - dragStart.current.y
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - dx
    containerRef.current.scrollTop = dragStart.current.scrollTop - dy
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const cursorClass = zoom <= 1 ? '' : isDragging ? 'cursor-grabbing' : 'cursor-grab'

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsDragging(false)
    }
    setOpen(nextOpen)
    if (nextOpen) {
      setZoom(1)
    }
  }

  if (!src) return <>{children}</>

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-5xl p-2 sm:p-4">
          <VisuallyHidden>
            <DialogTitle>{alt}</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center gap-1 mb-2">
            <Button variant="outline" size="icon-sm" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={resetZoom} disabled={zoom === 1}>
              <Maximize className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground ml-2">{Math.round(zoom * 100)}%</span>
          </div>
          <div
            ref={containerRef}
            className={`overflow-auto max-h-[80vh] flex items-center justify-center ${cursorClass}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="rounded object-contain transition-transform duration-150 select-none pointer-events-none"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              draggable={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}