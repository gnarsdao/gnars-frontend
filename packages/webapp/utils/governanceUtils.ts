import { ProposalsQuery, ProposalStatus } from "../.graphclient"
import { BigNumber } from "ethers"

export type EffectiveProposalStatus =
  | ProposalStatus
  | "SUCCEEDED"
  | "DEFEATED"
  | "EXPIRED"
  | "UNDETERMINED"

export const getProposalEffectiveStatus = (
  proposal: ProposalsQuery["proposals"][0],
  blockNumber: number | undefined,
  blockTimestamp: number | undefined
): EffectiveProposalStatus => {
  switch (true) {
    case proposal.status === "CANCELLED":
    case proposal.status === "EXECUTED":
    case proposal.status === "VETOED":
      return proposal.status
    case !blockNumber:
      return "UNDETERMINED"
    case proposal.status === "PENDING":
      return blockNumber! <= parseInt(proposal.startBlock)
        ? "PENDING"
        : "ACTIVE"
    case proposal.status === "ACTIVE":
      if (blockNumber! < parseInt(proposal.endBlock)) return "ACTIVE"
      const forVotes = BigNumber.from(proposal.forVotes)
      return forVotes.lte(proposal.againstVotes) ||
        forVotes.lt(proposal.quorumVotes)
        ? "DEFEATED"
        : "SUCCEEDED"
    case !blockTimestamp || !proposal.executionETA:
      return "UNDETERMINED"
    case proposal.status === "QUEUED":
      const GRACE_PERIOD = 14 * 60 * 60 * 24
      return blockTimestamp! >= parseInt(proposal.executionETA) + GRACE_PERIOD
        ? "EXPIRED"
        : "QUEUED"
    default:
      return "UNDETERMINED"
  }
}

export const isFinalized = (effectiveStatus: EffectiveProposalStatus) =>
  [
    "SUCCEEDED",
    "DEFEATED",
    "EXECUTED",
    "EXPIRED",
    "CANCELLED",
    "VETOED",
  ].includes(effectiveStatus)

export const getQuorumVotes = (prop: ProposalsQuery["proposals"][0]) => {
  const againstVotesBPS =
    (10_000 * parseInt(prop.againstVotes)) / parseInt(prop.totalSupply)
  const quorumAdjustmentBPS =
    (parseInt(prop.quorumCoefficient) * againstVotesBPS) / 1_000_000
  const adjustedQuorumBPS = prop.minQuorumVotesBPS + quorumAdjustmentBPS
  const quorumBPS = Math.min(prop.maxQuorumVotesBPS, adjustedQuorumBPS)
  return {
    min: Math.ceil((prop.minQuorumVotesBPS * prop.totalSupply) / 10_000),
    max: Math.ceil((prop.maxQuorumVotesBPS * prop.totalSupply) / 10_000),
    current: Math.ceil((quorumBPS * prop.totalSupply) / 10_000),
  }
}

// function bps2Uint(uint256 bps, uint256 number) internal pure returns (uint256) {
//         return (number * bps) / 10000;
//     }

// uint256 againstVotesBPS = (10000 * againstVotes) / totalSupply;
//         uint256 quorumAdjustmentBPS = (params.quorumCoefficient * againstVotesBPS) / 1e6;
//         uint256 adjustedQuorumBPS = params.minQuorumVotesBPS + quorumAdjustmentBPS;
//         uint256 quorumBPS = min(params.maxQuorumVotesBPS, adjustedQuorumBPS);
//         return bps2Uint(quorumBPS, totalSupply);