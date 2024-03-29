import { Row, Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import classes from './Winner.module.css';
import ShortAddress from '../ShortAddress';
import clsx from 'clsx';

import { useActiveLocale } from '../../hooks/useActivateLocale';

interface WinnerProps {
  winner: string;
  isNounders?: boolean;
  isNounsDAO?: boolean;
}

const Winner: React.FC<WinnerProps> = props => {
  const { winner, isNounders, isNounsDAO } = props;
  const activeAccount = useAppSelector(state => state.account.activeAccount);

  const isCool = useAppSelector(state => state.application.isCoolBackground);

  const isWinnerYou =
    activeAccount !== undefined && activeAccount.toLocaleLowerCase() === winner.toLocaleLowerCase();

  const activeLocale = useActiveLocale();

  const nonNounderNounContent = isWinnerYou ? (
    <Row className={classes.youSection}>
      <Col lg={activeLocale === 'ja-JP' ? 8 : 4} className={classes.youCopy}>
        <h2
          className={classes.winnerContent}
          style={{
            color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
          }}
        >
          You
        </h2>
      </Col>
    </Row>
  ) : (
    <ShortAddress size={40} address={winner} avatar={true} />
  );

  const nounderNounContent = 'sznounders.eth';

  const nounsDAONounContent = (
    <a
      href="https://etherscan.io/tokenholdings?a=0x0BC3807Ec262cB779b38D65b38158acC3bfedE10"
      style={{ color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
    >
      Nouns DAO
    </a>
  );

  return (
    <>
      <Row className={clsx(classes.wrapper, classes.section)}>
        <Col xs={1} lg={12} className={classes.leftCol}>
          <h4
            style={{
              color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
            }}
            className={classes.winnerCopy}
          >
            Winner
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.winnerContent}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            {isNounders
              ? nounderNounContent
              : isNounsDAO
              ? nounsDAONounContent
              : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
    </>
  );
};

export default Winner;
