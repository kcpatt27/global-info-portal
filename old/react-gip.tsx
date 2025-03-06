"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, Users, DollarSign, TrendingUp, Percent } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type CountryData = {
  name: string
  continent: string
  capital: string
  population: number
  gdp: number
  revenue: number
  povertyRate: number
  background: string
  historicalData: { year: number; gdp: number }[]
}

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [countryData, setCountryData] = useState<CountryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonURL = "https://raw.githubusercontent.com/kcpatt27/world-atlas-2-world-factbook/main/world%20atlas%20json%2050m"
        const tsvURL = "https://raw.githubusercontent.com/kcpatt27/world-atlas-2-world-factbook/main/world%20atlas%20tsv_rows.tsv"

        const [jsonResponse, tsvResponse] = await Promise.all([
          fetch(jsonURL),
          fetch(tsvURL)
        ])

        const topoJSONdata = await jsonResponse.json()
        const tsvData = await tsvResponse.text()

        renderMap(topoJSONdata, d3.tsvParse(tsvData))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderMap = (topoJSONdata: any, tsvData: any[]) => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 960
    const height = 500

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2])

    const pathGenerator = d3.geoPath().projection(projection)

    svg.append('path')
      .attr('class', 'sphere')
      .attr('d', pathGenerator({ type: 'Sphere' }))

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries)

    svg.selectAll('path.country')
      .data(countries.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .on('click', (event, d: any) => {
        const country = tsvData.find(c => c.iso_n3 === d.id)
        if (country) {
          // Simulating API call to get more detailed country data
          setTimeout(() => {
            setCountryData({
              name: country.name,
              continent: country.continent,
              capital: "Capital City", // This would come from the API
              population: Math.floor(Math.random() * 100000000),
              gdp: Math.floor(Math.random() * 1000000000000),
              revenue: Math.floor(Math.random() * 1000000000000),
              povertyRate: Math.random() * 30,
              background: "This is a brief background of the country...",
              historicalData: Array.from({ length: 10 }, (_, i) => ({
                year: 2013 + i,
                gdp: Math.floor(Math.random() * 1000000000000)
              }))
            })
          }, 500) // Simulating API delay
        }
      })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="map-container mb-8">
        <svg ref={svgRef} width="100%" height="500" viewBox="0 0 960 500" preserveAspectRatio="xMidYMid meet"></svg>
      </div>
      <AnimatePresence>
        {countryData && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="info-container grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>{countryData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Continent:</strong> {countryData.continent}</p>
                <p><strong>Capital:</strong> {countryData.capital}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Users className="mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Population</p>
                    <p className="text-2xl font-bold">{countryData.population.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">GDP</p>
                    <p className="text-2xl font-bold">${(countryData.gdp / 1e9).toFixed(2)}B</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${(countryData.revenue / 1e9).toFixed(2)}B</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Percent className="mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Poverty Rate</p>
                    <p className="text-2xl font-bold">{countryData.povertyRate.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>GDP Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={countryData.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="gdp" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{countryData.background}</p>
              </CardContent>
            </Card>
            <div className="md:col-span-2 flex justify-center">
              <Button>
                Learn More
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}