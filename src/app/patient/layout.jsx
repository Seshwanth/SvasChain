'use client'

import React from 'react'
import { RainbowKitWrapperComponent } from '@/context'

const layout = ({children}) => {
  return (
    <RainbowKitWrapperComponent>{children}</RainbowKitWrapperComponent>
  )
}

export default layout