"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function ComponentsShowcase() {
  const [email, setEmail] = useState("")
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <div className="container mx-auto py-12 space-y-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">CVA Components Showcase</h1>
        <p className="text-muted-foreground">
          Demo semua component yang sudah di-refactor dengan Class Variance Authority
        </p>
      </div>

      {/* Button Variants */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Button Variants</h2>
          <p className="text-sm text-muted-foreground">
            Different button styles for different use cases
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Sizes</h3>
            <div className="flex items-center flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Combinations</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" size="sm">
                Delete (Small)
              </Button>
              <Button variant="outline" size="lg">
                Cancel (Large)
              </Button>
              <Button variant="ghost" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Card Variants */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Card Variants</h2>
          <p className="text-sm text-muted-foreground">
            Different card elevations and styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default</CardTitle>
              <CardDescription>Border + shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Standard card style with subtle shadow and border.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
              <CardDescription>Prominent shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card with larger shadow for emphasis.</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined</CardTitle>
              <CardDescription>Thick border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card with thicker border, no shadow.</p>
            </CardContent>
          </Card>

          <Card variant="flat">
            <CardHeader>
              <CardTitle>Flat</CardTitle>
              <CardDescription>No border/shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Minimal flat design for subtle sections.</p>
            </CardContent>
          </Card>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Product Example</CardTitle>
            <CardDescription>$99.99</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton variant="rectangular" className="w-full h-48 mb-4" />
            <p className="text-sm">
              This is an example of how a product card might look with various components.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button className="flex-1">Add to Cart</Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Input Variants */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Input Variants</h2>
          <p className="text-sm text-muted-foreground">
            Different input states for validation feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default</label>
            <Input variant="default" placeholder="Enter text..." />
            <p className="text-xs text-muted-foreground">Normal input state</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Error</label>
            <Input variant="error" placeholder="invalid@email" defaultValue="invalid" />
            <p className="text-xs text-destructive">This field is required</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Success</label>
            <Input variant="success" placeholder="valid@email.com" defaultValue="user@example.com" />
            <p className="text-xs text-green-600">Looks good!</p>
          </div>
        </div>

        <Card variant="outlined" className="max-w-md">
          <CardHeader>
            <CardTitle>Live Email Validation</CardTitle>
            <CardDescription>Try typing an email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant={
                email === "" ? "default" : isValidEmail ? "success" : "error"
              }
            />
            {email !== "" && (
              <p className={`text-sm ${isValidEmail ? "text-green-600" : "text-destructive"}`}>
                {isValidEmail
                  ? "✓ Valid email format"
                  : "✗ Invalid email format"}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Badge Variants */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Badge Variants</h2>
          <p className="text-sm text-muted-foreground">
            Status indicators and labels
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">All Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #1234</CardTitle>
                    <Badge variant="success">Paid</Badge>
                  </div>
                  <CardDescription>Placed on Jan 18, 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">2 items • $199.99</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #1235</CardTitle>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <CardDescription>Placed on Jan 18, 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">1 item • $49.99</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Electronics</Badge>
                <Badge variant="outline">Gadgets</Badge>
                <Badge variant="outline">New Arrival</Badge>
                <Badge variant="success">In Stock</Badge>
                <Badge variant="secondary">Featured</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skeleton Variants */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Skeleton Variants</h2>
          <p className="text-sm text-muted-foreground">
            Loading states for different content types
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Default</p>
              <Skeleton variant="default" className="h-12 w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Rectangular</p>
              <Skeleton variant="rectangular" className="h-12 w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Circular</p>
              <Skeleton variant="circular" className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Text</p>
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loading State Example</CardTitle>
              <CardDescription>Typical product card skeleton</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton variant="rectangular" className="h-48 w-full" />
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2" />
              <div className="flex gap-2">
                <Skeleton variant="rectangular" className="h-10 flex-1" />
                <Skeleton variant="rectangular" className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-3/4" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t">
        <p className="text-sm text-muted-foreground text-center">
          All components refactored with{" "}
          <Badge variant="outline">Class Variance Authority</Badge> for type
          safety and better developer experience 🚀
        </p>
      </footer>
    </div>
  )
}
