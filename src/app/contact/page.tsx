'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Youtube } from 'lucide-react'
import { addMessage } from '@/lib/realtimeProducts'

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Save to database
      await addMessage({
        name: contactForm.name,
        email: contactForm.email,
        message: `Telefon: ${contactForm.phone}\n\n${contactForm.message}`
      })

      // Send email notification
      const emailSubject = `Nova poruka od ${contactForm.name}`
      const emailBody = `
Ime: ${contactForm.name}
Email: ${contactForm.email}
Telefon: ${contactForm.phone}

Poruka:
${contactForm.message}
      `.trim()

      // Create mailto link to send email
      const mailtoLink = `mailto:podrska@easygo.ba?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      
      // Try to open email client (this will work on most devices)
      window.location.href = mailtoLink

      setSubmitSuccess(true)
      setContactForm({ name: '', email: '', phone: '', message: '' })
      
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <MessageCircle className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Kontaktirajte nas</h1>
            <p className="text-muted text-base lg:text-lg">
              Imate pitanje? Tu smo da vam pomognemo. Kontaktirajte nas putem forme ili direktno.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Phone Card */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Telefon</h3>
              <a href="tel:+38767123249" className="text-muted hover:text-primary transition-colors text-sm">
                +387 67 123 5249
              </a>
              <p className="text-xs text-muted mt-2">Pon - Pet: 09:00 - 17:00</p>
            </div>

            {/* Email Card */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Email</h3>
              <a href="mailto:podrska@easygo.ba" className="text-muted hover:text-primary transition-colors text-sm break-all">
                podrska@easygo.ba
              </a>
              <p className="text-xs text-muted mt-2">Odgovaramo u roku 24h</p>
            </div>

            {/* Location Card */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Lokacija</h3>
              <p className="text-muted text-sm">
                Bosna i Hercegovina
              </p>
            </div>

            {/* Working Hours Card */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-3">Radno vrijeme</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Ponedjeljak - Petak</span>
                  <span className="text-text font-medium">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Subota</span>
                  <span className="text-text font-medium">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Nedjelja</span>
                  <span className="text-danger font-medium">Zatvoreno</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-text mb-4">Pratite nas</h3>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/profile.php?id=61569683799611" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-primary/20 hover:text-primary transition-all group"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/easygo.bih/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-primary/20 hover:text-primary transition-all group"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@easygo-reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-primary/20 hover:text-primary transition-all group"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Form */}
            <div className="bg-surface rounded-2xl p-6 lg:p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-text mb-2">Pošaljite nam poruku</h2>
              <p className="text-muted text-sm mb-6">Popunite formu i javit ćemo vam se u najkraćem roku</p>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                  <p className="text-accent text-sm font-medium">✓ Poruka uspješno poslana! Odgovorit ćemo vam uskoro.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Ime i prezime *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={e => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="Vaše ime"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Email adresa *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="vas@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="+387 6X XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Poruka *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    rows={6}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary resize-none transition-colors"
                    placeholder="Kako vam možemo pomoći?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Šalje se...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Pošalji poruku
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="bg-surface rounded-2xl overflow-hidden border border-white/5">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.2345678901234!2d18.413029!3d43.856430!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4758c8d4c3e3e3e3%3A0x1234567890abcdef!2sStup%2C%20Sarajevo%2C%20Bosnia%20and%20Herzegovina!5e0!3m2!1sen!2sba!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
