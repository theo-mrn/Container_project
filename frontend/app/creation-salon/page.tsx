"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import InformationsGenerales from "./components/InformationsGenerales"
import ImagesUpload from "./components/ImagesUpload"
import MenuConfiguration from "./components/MenuConfiguration"
import Confirmation from "./components/Confirmation"

type Image = {
  image_url: string;
  image_type: "main" | "interior" | "food" | "other";
  display_order: number;
};

// Define a type for the formData sections
interface FormData {
  informations: {
    name: string;
    description: string;
    cuisine: string;
    location: string;
    features: string[];
  };
  images: Image[];
  menu: {
    categories: { name: string; items: { name: string; description: string; price: number }[] }[];
  };
}

const steps = [
  { id: 1, title: "Informations générales" },
  { id: 2, title: "Images" },
  { id: 3, title: "Menu" },
  { id: 4, title: "Confirmation" }
]

export default function CreationSalonPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    informations: {
      name: "",
      description: "",
      cuisine: "",
      location: "",
      features: [] as string[]
    },
    images: [] as Image[],
    menu: {
      categories: [] as { name: string; items: { name: string; description: string; price: number }[] }[]
    }
  } as FormData)

  const updateFormData = (section: keyof FormData, data: FormData[keyof FormData]) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InformationsGenerales
            data={formData.informations}
            onUpdate={(data) => updateFormData("informations", data)}
          />
        )
      case 2:
        return (
          <ImagesUpload
            data={formData.images}
            onUpdate={(data) => updateFormData("images", data)}
          />
        )
      case 3:
        return (
          <MenuConfiguration
            data={formData.menu}
            onUpdate={(data) => updateFormData("menu", data)}
          />
        )
      case 4:
        return <Confirmation formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Création d&apos;un nouveau salon</h1>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.id <= currentStep ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-24 mx-2 ${
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-sm text-muted-foreground">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-lg p-6 shadow-sm"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            {currentStep === steps.length ? "Terminer" : "Suivant"}
            {currentStep !== steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
} 