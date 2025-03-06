'use client'

import RainbowKitWrapperComponent from '../context/rainbow-kit-wrapper-component'
import { useWallet } from '../context/rainbow-kit-wrapper-component'

const HomeContent = () => {
  const { walletAddress } = useWallet()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        {walletAddress ? (
          <p className="text-sm font-medium">Connected Wallet: {walletAddress}</p>
        ) : (
          <p className="text-sm text-gray-500">No wallet connected</p>
        )}
      </div>
    </div>
  )
}

const HomePage = () => {
  return (
    <RainbowKitWrapperComponent>
      <HomeContent />
    </RainbowKitWrapperComponent>
  )
}

export default HomePage