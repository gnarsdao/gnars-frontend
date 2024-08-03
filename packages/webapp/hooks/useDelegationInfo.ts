import { DelegateDocument, execute } from "subgraph/layer-1"
import { useQuery } from "@tanstack/react-query"

export const delegationInfoQueryKey = (address?: `0x${string}`) => ["delegateProposals", address]

export const useDelegationInfo = (address?: `0x${string}`) => {
  return useQuery({
    queryKey: delegationInfoQueryKey(address),
    queryFn: () => execute(DelegateDocument, { id: address?.toLowerCase() }).then((q: { data: any }) => q.data),
     keepPreviousData: true, enabled: !!address, refetchInterval: 15000 }
  )
}
