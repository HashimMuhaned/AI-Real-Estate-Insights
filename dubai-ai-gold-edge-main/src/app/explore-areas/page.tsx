"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, BarChart3, Building, Home, Percent } from "lucide-react";
import { BsStars } from "react-icons/bs";

import AreaCardWithProjectsNumList from "@/components/explore-area-cards/(explore-area-invest-mode)/(num-of-projects)/AreaCardWithProjectsNumList";
import AreaCardWithRentalYeildsList from "@/components/explore-area-cards/(explore-area-invest-mode)/(rental-yeilds)/AreaCardWithRentalYeildsList";
import AreaCardWithROIGrowthList from "@/components/explore-area-cards/(explore-area-invest-mode)/(roi-growth)/AreaCardWithROIGrowthList";
import AreaCardWithTransactionsList from "@/components/explore-area-cards/(explore-area-invest-mode)/(transactions)/AreaCardWIthTransactionsList";

// import { useChatWidget } from "@/context/ChatWidgetContext";

const investmentData = {
  projectCounts: {
    title: "Avg. prices & rents",
    icon: Building,
    filterOptions: [
      { value: "all", label: "All Areas" },
      { value: "villa_sale_high", label: "High Villa Sale Price" },
      { value: "villa_sale_low", label: "Low Villa Sale Price" },
      { value: "villa_rent_high", label: "High Villa Rent" },
      { value: "villa_rent_low", label: "Low Villa Rent" },
      { value: "apt_sale_high", label: "High Apartment Sale Price" },
      { value: "apt_sale_low", label: "Low Apartment Sale Price" },
      { value: "apt_rent_high", label: "High Apartment Rent" },
      { value: "apt_rent_low", label: "Low Apartment Rent" },
    ],
  },
  rentalYields: {
    title: "Rental Yields",
    icon: Percent,
    filterOptions: [
      { value: "all", label: "All Areas" },
      { value: "yield_high", label: "High Rental Yield (>6%)" },
      { value: "yield_low", label: "Low Rental Yield (<4%)" },
      { value: "villa_yield_high", label: "High Villa Yield" },
      { value: "villa_yield_low", label: "Low Villa Yield" },
      { value: "apt_yield_high", label: "High Apartment Yield" },
      { value: "apt_yield_low", label: "Low Apartment Yield" },
    ],
  },
  roiGrowth: {
    title: "ROI & Price Growth (1-year)",
    icon: TrendingUp,
    filterOptions: [
      { value: "all", label: "All Areas" },
      { value: "growth_high", label: "High Growth (>10%)" },
      { value: "growth_low", label: "Low Growth (<5%)" },
      { value: "villa_growth_high", label: "High Villa Growth" },
      { value: "villa_growth_low", label: "Low Villa Growth" },
      { value: "apt_growth_high", label: "High Apartment Growth" },
      { value: "apt_growth_low", label: "Low Apartment Growth" },
    ],
  },
  transactions: {
    title: "Transactions (1-year)",
    icon: BarChart3,
    filterOptions: [
      { value: "all", label: "All Areas" },
      { value: "transactions_high", label: "High Transaction Volume (All)" },
      { value: "transactions_low", label: "Low Transaction Volume (All)" },
      { value: "villa_transactions_high", label: "High Villa Transactions" },
      { value: "villa_transactions_low", label: "Low Villa Transactions" },
      { value: "apt_transactions_high", label: "High Apartment Transactions" },
      { value: "apt_transactions_low", label: "Low Apartment Transactions" },
    ],
  },
};

const AreasPage = () => {
  const [selectedMode, setSelectedMode] = useState<
    "investment" | "residential"
  >("investment");
  const [selectedCard, setSelectedCard] = useState<
    "projectCounts" | "rentalYields" | "roiGrowth" | "transactions"
  >("projectCounts");
  const [priceFilter, setPriceFilter] = useState("all");
  const [rentalFilter, setRentalFilter] = useState("all");
  const [roiFilter, setRoiFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // const { openChat } = useChatWidget();

  const handleFilterChange = (value: string) => {
    switch (selectedCard) {
      case "projectCounts":
        setPriceFilter(value);
        break;
      case "rentalYields":
        setRentalFilter(value);
        break;
      case "roiGrowth":
        setRoiFilter(value);
        break;
      case "transactions":
        setTransactionFilter(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary to-primary/80 geometric-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Explore Dubai Areas
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover investment opportunities across Dubai's most promising
              neighborhoods. Select an area to view detailed market insights and
              analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Mode Toggle */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">
              Are you looking for investment opportunities or residential deals?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose your preferred mode to view tailored insights and data for
              each area
            </p>
            <div className="flex justify-center">
              <div className="bg-muted rounded-xl p-2 inline-flex gap-2">
                <Button
                  variant={selectedMode === "investment" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setSelectedMode("investment")}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Investment Opportunities
                </Button>
                <Button
                  variant={selectedMode === "residential" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setSelectedMode("residential")}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Residential Deals
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {/* Category Buttons */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(investmentData).map(([key, data]) => (
                    <Button
                      key={key}
                      variant={selectedCard === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCard(key as any)}
                      className="text-xs whitespace-nowrap"
                    >
                      {data.title}
                    </Button>
                  ))}
                </div>

                {/* Dropdown */}
                <div className="w-56 flex-shrink-0">
                  <Select onValueChange={(value) => handleFilterChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentData[selectedCard].filterOptions.map(
                        (option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="w-56 flex-shrink-0">
                  <Input
                    type="text"
                    placeholder="Search area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Area Cards Content */}
              <div className="w-full flex">
                <div className="w-full">
                  {selectedCard === "projectCounts" && (
                    <AreaCardWithProjectsNumList
                      filter={priceFilter}
                      search={searchTerm}
                    />
                  )}

                  {selectedCard === "rentalYields" && (
                    <AreaCardWithRentalYeildsList
                      filter={rentalFilter}
                      search={searchTerm}
                    />
                  )}

                  {selectedCard === "roiGrowth" && (
                    <AreaCardWithROIGrowthList
                      filter={roiFilter}
                      search={searchTerm}
                    />
                  )}

                  {selectedCard === "transactions" && (
                    <AreaCardWithTransactionsList
                      filter={transactionFilter}
                      search={searchTerm}
                    />
                  )}
                </div>
                <div className="lg:w-80 flex-shrink-0 pl-10">
                  <div className="sticky top-24">
                    <Card className="luxury-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full from-primary to-accent flex items-center justify-center">
                            <BsStars />
                          </div>
                          Need Help Choosing?
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Let our AI analyze your investment preferences and
                          recommend the best areas for your portfolio.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald"></div>
                            <span>Personalized recommendations</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald"></div>
                            <span>Risk assessment</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald"></div>
                            <span>ROI projections</span>
                          </div>
                        </div>
                        <Button
                          className="w-full cta-emerald"
                          // onClick={openChat}
                        >
                          Get AI Recommendations
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AreasPage;
