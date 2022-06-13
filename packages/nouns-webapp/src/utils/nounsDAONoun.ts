import { Auction } from '../wrappers/nounsAuction';
import { AuctionState } from '../state/slices/auction';
import { BigNumber } from '@ethersproject/bignumber';

export const isNounsDAONoun = (nounId: BigNumber) => {
  return nounId.mod(20).eq(1) || nounId.eq(1);
};

const emptyNounsDAOAuction = (onDisplayAuctionId: number): Auction => {
  return {
    amount: BigNumber.from(0).toJSON(),
    bidder: '',
    startTime: BigNumber.from(0).toJSON(),
    endTime: BigNumber.from(0).toJSON(),
    nounId: BigNumber.from(onDisplayAuctionId).toJSON(),
    settled: false,
  };
};

const findAuction = (id: BigNumber, auctions: AuctionState[]): Auction | undefined => {
  return auctions.find(auction => {
    return BigNumber.from(auction.activeAuction?.nounId).eq(id);
  })?.activeAuction;
};

/**
 *
 * @param nounId
 * @param pastAuctions
 * @returns empty `Auction` object with `startTime` set to auction after param `nounId`
 */
export const generateEmptyNounsDAOAuction = (
  nounId: BigNumber,
  pastAuctions: AuctionState[],
): Auction => {
  const nounsDAOAuction = emptyNounsDAOAuction(nounId.toNumber());
  // use nounsDAOAuction.nounId + 1 to get mint time
  const auctionAbove = findAuction(nounId.add(1), pastAuctions);
  const auctionAboveStartTime = auctionAbove && BigNumber.from(auctionAbove.startTime);
  if (auctionAboveStartTime) nounsDAOAuction.startTime = auctionAboveStartTime.toJSON();

  return nounsDAOAuction;
};
