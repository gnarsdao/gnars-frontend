import { useQuery } from "@tanstack/react-query"
import { getBuiltGraphSDK, WalletOgGnarsQuery } from "../.graphclient"

export const useWalletOgGnars = (address?: string) => {
  const sdk = getBuiltGraphSDK()
  return useQuery<WalletOgGnarsQuery["ogGnars"]>(
    ["ogGnarsClaimStatus", address],
    () => {
      if (!address) {
        return []
      }

      return sdk.WalletOgGnars({ owner: address }).then((r) => r.ogGnars)
    },
    {
      refetchInterval: 12000,
    }
  )
}
