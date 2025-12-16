"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  VIDEO_TESTIMONIALS,
  type VideoTestimonial,
} from "@/lib/videoTestimonials";

function VideoCard({
  testimonial,
  onClick,
}: {
  testimonial: VideoTestimonial;
  onClick: () => void;
}) {
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const [hasLoadedFrame, setHasLoadedFrame] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Use Intersection Observer to load videos only when visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }, // Start loading 50px before visible
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const video = thumbnailVideoRef.current;
    if (!video) return;

    let hasShownThumbnail = false;
    let retryCount = 0;
    const maxRetries = 3;

    const showThumbnail = () => {
      if (hasShownThumbnail) return;
      hasShownThumbnail = true;
      setHasLoadedFrame(true);
    };

    const attemptFrameCapture = async () => {
      if (hasShownThumbnail) return;

      // Ensure video has enough data
      if (video.readyState < 2) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptFrameCapture, 300);
        }
        return;
      }

      try {
        // Seek to first frame
        video.currentTime = 0.1;

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
        });

        // Try to play briefly to render frame
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }

          // Wait for frame to render using requestAnimationFrame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              video.pause();
              video.currentTime = 0.1;
              showThumbnail();
            });
          });
        } catch {
          // Autoplay blocked - try showing frame anyway
          // Some browsers show frames even when paused
          setTimeout(() => {
            showThumbnail();
          }, 300);
        }
      } catch {
        // Retry if failed
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptFrameCapture, 500);
        } else {
          // Final fallback - show video anyway
          showThumbnail();
        }
      }
    };

    const handleCanPlayThrough = () => {
      // Enough data loaded to play through - good time to capture frame
      attemptFrameCapture();
    };

    const handleLoadedData = () => {
      // Try to capture frame when data is loaded
      if (video.readyState >= 2) {
        attemptFrameCapture();
      }
    };

    const handleCanPlay = () => {
      // Video can play - try capturing frame
      if (video.readyState >= 2 && !hasShownThumbnail) {
        attemptFrameCapture();
      }
    };

    const handleError = (e: Event) => {
      console.warn("Video thumbnail failed to load:", testimonial.videoUrl, e);
      // Show fallback gradient on error
      if (!hasShownThumbnail) {
        setTimeout(() => showThumbnail(), 1000);
      }
    };

    // Add event listeners
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Start loading video
    video.load();

    // Fallback timeout - show thumbnail after 3 seconds even if not loaded
    const fallbackTimeout = setTimeout(() => {
      if (!hasShownThumbnail && video.readyState >= 1) {
        showThumbnail();
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [testimonial.videoUrl, shouldLoad]);

  return (
    <button
      ref={containerRef}
      onClick={onClick}
      className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:shadow-xl dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:border-blue-500"
    >
      {/* Use poster image if available, otherwise try video thumbnail */}
      {testimonial.posterUrl ? (
        <Image
          src={testimonial.posterUrl}
          alt={testimonial.name || "Student testimonial thumbnail"}
          fill
          className="object-cover"
        />
      ) : (
        <>
          {/* Video thumbnail - shows first frame directly */}
          {shouldLoad && (
            <video
              ref={thumbnailVideoRef}
              src={testimonial.videoUrl}
              preload="auto"
              muted
              playsInline
              className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${
                hasLoadedFrame ? "opacity-100" : "opacity-0"
              }`}
              style={{ pointerEvents: "none" }}
            />
          )}
          {/* Fallback gradient - shown while video loads */}
          {!hasLoadedFrame && (
            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" />
          )}
        </>
      )}

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Play button overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110 dark:bg-slate-800/90">
          <Play className="ml-1 h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
        <p className="text-sm font-medium text-white">
          {testimonial.name || "Student Testimonial"}
        </p>
        {testimonial.role && (
          <p className="text-xs text-white/80">{testimonial.role}</p>
        )}
      </div>
    </button>
  );
}

function VideoModal({
  testimonial,
  open,
  onOpenChange,
}: {
  testimonial: VideoTestimonial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop video when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {testimonial?.name || "Student Testimonial"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Video testimonial from {testimonial?.name || "a student"}
        </DialogDescription>
        {testimonial && (
          <div className="relative aspect-[9/16] max-h-[80vh] w-full bg-black">
            <video
              ref={videoRef}
              src={testimonial.videoUrl}
              controls
              playsInline
              autoPlay
              preload="metadata"
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function VideoTestimonialsSection() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Delay clearing selected video to allow close animation
      setTimeout(() => setSelectedVideo(null), 200);
    }
  };

  if (VIDEO_TESTIMONIALS.length === 0) return null;

  return (
    <section className="section-padding bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/30">
      <div className="container">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Hear From Our Students
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Real stories from students who transformed their understanding of
            mental health with The Mind Point
          </p>
        </div>

        {/* Grid for desktop, horizontal scroll for mobile */}
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-6">
          {VIDEO_TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-[200px] flex-shrink-0 md:w-auto"
            >
              <VideoCard
                testimonial={testimonial}
                onClick={() => handleCardClick(testimonial)}
              />
            </div>
          ))}
        </div>
      </div>

      <VideoModal
        testimonial={selectedVideo}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />
    </section>
  );
}
