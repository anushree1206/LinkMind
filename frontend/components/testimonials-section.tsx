"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Sales Director",
    company: "TechCorp",
    content:
      "This app transformed how I manage my professional network. The AI insights helped me identify key relationships I was neglecting and improved my follow-up game significantly.",
    rating: 5,
    avatar: "/professional-woman-diverse.png",
  },
  {
    name: "Marcus Johnson",
    role: "Entrepreneur",
    company: "StartupXYZ",
    content:
      "The relationship strength tracking is incredible. I can see exactly when my connections are getting weaker and take action before it's too late. Game-changer for networking.",
    rating: 5,
    avatar: "/professional-man.png",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "GrowthCo",
    content:
      "The communication analysis feature helped me understand my tone better. My response rates have improved by 40% since I started using the AI recommendations.",
    rating: 5,
    avatar: "/professional-woman-smiling.png",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Loved by Professionals Worldwide</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our AI-powered relationship manager is helping people build stronger connections and grow their
            networks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                 <blockquote className="text-card-foreground mb-6 leading-relaxed">
  {`"${testimonial.content}"`}
</blockquote>

                  <div className="flex items-center gap-3">
                    <Image
  src={testimonial.avatar || "/placeholder.svg"}
  alt={testimonial.name}
  width={48} // match your w-12
  height={48} // match your h-12
  className="rounded-full object-cover"
/>
                    <div>
                      <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
