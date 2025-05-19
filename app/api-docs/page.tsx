import dynamic from "next/dynamic"
import Header from "@/components/header"

// Use dynamic import with error handling for the SwaggerExplorer
const SwaggerExplorer = dynamic(() => import("@/components/swagger-explorer"), {
  ssr: false,
  loading: () => (
    <div className="bg-white border rounded-lg p-8 animate-pulse">
      <div className="h-8 bg-gray-200 w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 w-3/4 mb-8"></div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-md"></div>
        <div className="h-32 bg-gray-200 rounded-md"></div>
        <div className="h-32 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  ),
  onError: (error) => {
    console.error("Error loading SwaggerExplorer:", error)
    return (
      <div className="bg-white border rounded-lg p-8">
        <h2 className="text-xl font-bold mb-4">API Documentation Unavailable</h2>
        <p className="text-red-500 mb-4">
          Unable to load the API documentation component. The Swagger documentation might not be accessible.
        </p>
        <p className="mb-4">This could be due to:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>CORS restrictions on the Swagger documentation endpoint</li>
          <li>Network connectivity issues</li>
          <li>The endpoint requiring authentication</li>
          <li>The documentation not being available in this environment</li>
        </ul>
        <p>You can try accessing the documentation directly at:</p>
        <code className="block bg-gray-100 p-2 mt-2 rounded">
          https://blue-penguin-872241.hostingersite.com/swagger/documentation/json?version=all
        </code>
      </div>
    )
  },
})

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
        <p className="text-gray-600 mb-8">
          E
        </p>

        <SwaggerExplorer />
      </main>

      <footer className="bg-gray-100 border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">© 2024 Tathaker Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
