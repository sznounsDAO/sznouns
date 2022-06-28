import { useState, useEffect, useRef } from 'react';
import { Auction } from '../../wrappers/nounsAuction';
import classes from './SettleManuallyBtn.module.css';
import dayjs from 'dayjs';
import { Button } from 'react-bootstrap';
import { CHAIN_ID } from '../../config';

const SettleManuallyBtn: React.FC<{
  settleAuctionHandler: () => void;
  auction: Auction;
}> = props => {
  const { settleAuctionHandler, auction } = props;

  const MINS_TO_ENABLE_MANUAL_SETTLEMENT = 5;

  const [settleEnabled, setSettleEnabled] = useState(false);
  const [auctionTimer, setAuctionTimer] = useState(MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60);
  const auctionTimerRef = useRef(auctionTimer); // to access within setTimeout
  auctionTimerRef.current = auctionTimer;

  const timerDuration = dayjs.duration(auctionTimerRef.current, 's');

  // timer logic
  useEffect(() => {
    // Allow immediate manual settlement when testing
    if (CHAIN_ID !== 1) {
      setSettleEnabled(true);
      setAuctionTimer(0);
      return;
    }

    // prettier-ignore
    const timeLeft = MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60 - (dayjs().unix() - (auction && Number(auction.endTime)));

    setAuctionTimer(auction && timeLeft);

    if (auction && timeLeft <= 0) {
      setSettleEnabled(true);
      setAuctionTimer(0);
    } else {
      const timer = setTimeout(() => {
        setAuctionTimer(auctionTimerRef.current - 1);
      }, 1_000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [auction, auctionTimer]);

  const mins = timerDuration.minutes();
  const minsContent = () => `${mins + 1} minute${mins !== 0 ? 's' : ''}`;

  return (
    <p className={classes.emergencySettleWrapper}>
      <Button
        className={classes.bidBtnAuctionEnded}
        onClick={settleAuctionHandler}
        disabled={!settleEnabled}
      >
        {settleEnabled ? (
          <>{` Settle auction`}</>
        ) : (
          <>{`You can settle manually in ${minsContent()}`}</>
        )}
      </Button>
    </p>
  );
};

export default SettleManuallyBtn;
