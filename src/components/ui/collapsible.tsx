"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import * as React from "react"

const Collapsible = React.memo(CollapsiblePrimitive.Root)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.memo(CollapsiblePrimitive.CollapsibleTrigger)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.memo(CollapsiblePrimitive.CollapsibleContent)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
