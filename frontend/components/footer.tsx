import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-sidebar border-t border-sidebar-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-sidebar-accent" />
              <span className="text-xl font-bold text-sidebar-foreground">RelationshipAI</span>
            </div>
            <p className="text-sidebar-foreground/80 mb-6 max-w-md">
              Build and maintain meaningful connections with helpful insights and simple tools.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-accent transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sidebar-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sidebar-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-8 text-center">
          <p className="text-sidebar-foreground/60">© 2025 RelationshipAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
