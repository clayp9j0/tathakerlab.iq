"use client"

import { useState, useEffect } from "react"
import { fetchSwaggerDocs } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface SwaggerPath {
  [method: string]: {
    tags: string[]
    summary: string
    description?: string
    parameters?: any[]
    responses: Record<string, any>
  }
}

interface SwaggerDefinition {
  type: string
  properties: Record<string, any>
  required?: string[]
}

export default function SwaggerExplorer() {
  const [swaggerDocs, setSwaggerDocs] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("endpoints")

  useEffect(() => {
    const loadSwaggerDocs = async () => {
      try {
        setIsLoading(true)
        const docs = await fetchSwaggerDocs()

        if (!docs) {
          setError(
            "API documentation is not available. The server might be restricting access or the documentation endpoint may not exist.",
          )
        } else {
          setSwaggerDocs(docs)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load API documentation")
        console.error("Error in SwaggerExplorer:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSwaggerDocs()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Loading API documentation...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Error loading API documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (!swaggerDocs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>No documentation available</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The API documentation could not be loaded.</p>
        </CardContent>
      </Card>
    )
  }

  // Group endpoints by tag
  const endpointsByTag: Record<string, { path: string; method: string; operation: any }[]> = {}

  Object.entries(swaggerDocs.paths || {}).forEach(([path, pathData]: [string, SwaggerPath]) => {
    Object.entries(pathData).forEach(([method, operation]) => {
      const tags = operation.tags || ["untagged"]

      tags.forEach((tag) => {
        if (!endpointsByTag[tag]) {
          endpointsByTag[tag] = []
        }

        endpointsByTag[tag].push({
          path,
          method,
          operation,
        })
      })
    })
  })

  // Get all definitions/models
  const definitions = swaggerDocs.definitions || {}

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{swaggerDocs.info?.title || "API Documentation"}</CardTitle>
        <CardDescription>{swaggerDocs.info?.description || "Explore the API endpoints and models"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(endpointsByTag).map(([tag, endpoints]) => (
                <AccordionItem key={tag} value={tag}>
                  <AccordionTrigger className="font-semibold text-lg">
                    {tag} <Badge className="ml-2">{endpoints.length}</Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {endpoints.map((endpoint, index) => (
                        <div key={`${endpoint.path}-${endpoint.method}-${index}`} className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`uppercase ${getMethodColor(endpoint.method)}`}>{endpoint.method}</Badge>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                          </div>
                          <p className="font-medium">{endpoint.operation.summary}</p>
                          {endpoint.operation.description && (
                            <p className="text-sm text-gray-600 mt-1">{endpoint.operation.description}</p>
                          )}

                          {endpoint.operation.parameters && endpoint.operation.parameters.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold mb-1">Parameters:</p>
                              <ul className="text-sm space-y-1">
                                {endpoint.operation.parameters.map((param: any, paramIndex: number) => (
                                  <li key={paramIndex} className="flex items-start">
                                    <span className="font-mono bg-gray-100 px-1 rounded mr-2">{param.name}</span>
                                    <span className="text-gray-600">
                                      ({param.in}) {param.required ? "required" : "optional"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-3">
                            <p className="text-sm font-semibold mb-1">Responses:</p>
                            <ul className="text-sm space-y-1">
                              {Object.entries(endpoint.operation.responses).map(([code, response]: [string, any]) => (
                                <li key={code} className="flex items-start">
                                  <Badge className={getResponseCodeColor(code)}>{code}</Badge>
                                  <span className="ml-2 text-gray-600">{response.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="models" className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(definitions).map(([name, definition]: [string, SwaggerDefinition]) => (
                <AccordionItem key={name} value={name}>
                  <AccordionTrigger className="font-semibold text-lg">{name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Type: {definition.type}</p>

                      {definition.required && definition.required.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold">Required Properties:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {definition.required.map((prop) => (
                              <Badge key={prop} variant="outline">
                                {prop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-2">Properties:</p>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(definition.properties).map(([propName, propDetails]: [string, any]) => (
                                <tr key={propName}>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    {propName}
                                    {definition.required?.includes(propName) && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    {propDetails.type || (propDetails.$ref && propDetails.$ref.split("/").pop())}
                                    {propDetails.format && ` (${propDetails.format})`}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{propDetails.description || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper functions for styling
function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case "get":
      return "bg-blue-100 text-blue-800"
    case "post":
      return "bg-green-100 text-green-800"
    case "put":
      return "bg-yellow-100 text-yellow-800"
    case "delete":
      return "bg-red-100 text-red-800"
    case "patch":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getResponseCodeColor(code: string): string {
  const codeNum = Number.parseInt(code, 10)
  if (codeNum >= 200 && codeNum < 300) {
    return "bg-green-100 text-green-800"
  } else if (codeNum >= 300 && codeNum < 400) {
    return "bg-blue-100 text-blue-800"
  } else if (codeNum >= 400 && codeNum < 500) {
    return "bg-yellow-100 text-yellow-800"
  } else if (codeNum >= 500) {
    return "bg-red-100 text-red-800"
  }
  return "bg-gray-100 text-gray-800"
}
