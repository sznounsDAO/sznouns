import React from 'react';
import classes from './NoundersPage.module.css';
import Section from '../../layout/Section';
import { Col, Row, Card } from 'react-bootstrap';
import pfpSznsNFT from '../../assets/nounder-pfps/sznsNFT.png';
import pfpJl2fa from '../../assets/nounder-pfps/jl2fa.png';
import pfpPersn_eth from '../../assets/nounder-pfps/persn_eth.png';
import pfpKloo_eth from '../../assets/nounder-pfps/kloo_eth.png';
import pfpJack_dille from '../../assets/nounder-pfps/jack_dille.png';
import pfpMinci from '../../assets/nounder-pfps/iamminci.png';
import pfp0xgoretex from '../../assets/nounder-pfps/0xgoretex.png';
import pfpSina_eth from '../../assets/nounder-pfps/sina_eth.png';
import pfpBlownedeth from '../../assets/nounder-pfps/andrew.png';
import pfpGabrielayuso from '../../assets/nounder-pfps/gabrielayuso.png';
import pfpBrentsketit from '../../assets/nounder-pfps/brentsketit.png';

const sznBios = [
  {
    name: 'sznsNFT',
    image: pfpSznsNFT,
    description: undefined,
    handle: 'sznsNFT',
  },
  {
    name: 'jl2fa',
    image: pfpJl2fa,
    description: undefined,
    handle: 'jl2fa',
  },
  {
    name: 'persn_eth',
    image: pfpPersn_eth,
    description: undefined,
    handle: 'persn_eth',
  },
  {
    name: 'kloo_eth',
    image: pfpKloo_eth,
    description: undefined,
    handle: 'kloo_eth',
  },
  {
    name: 'jack_dille',
    image: pfpJack_dille,
    description: undefined,
    handle: 'jack_dille',
  },
];
const bigBrainBios = [
  {
    name: 'iamminci',
    image: pfpMinci,
    description: undefined,
    handle: 'iamminci',
  },
  {
    name: '0xgoretex',
    image: pfp0xgoretex,
    description: undefined,
    handle: '0xgoretex',
  },
  {
    name: 'sina_eth',
    image: pfpSina_eth,
    description: undefined,
    handle: 'sina_eth',
  },
  {
    name: 'blownedeth',
    image: pfpBlownedeth,
    description: undefined,
    handle: 'blownedeth',
  },
  {
    name: 'gabrielayuso',
    image: pfpGabrielayuso,
    description: undefined,
    handle: 'gabrielayuso',
  },
  {
    name: 'brentsketit',
    image: pfpBrentsketit,
    description: undefined,
    handle: 'brentsketit',
  },
];

const BioCard: React.FC<{
  name: string;
  description?: string | undefined;
  image: string;
  handle?: string | undefined;
}> = props => {
  const { name, description, image, handle } = props;
  return (
    <>
      <Card.Img variant="top" src={image} />
      <Card.Title>
        {handle && (
          <a href={`https://twitter.com/${handle}`} target="_blank" rel="noreferrer">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={classes.twitterIcon}
              data-v-6cab4e66=""
            >
              <path
                d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
                data-v-6cab4e66=""
              ></path>
            </svg>
            {name}
          </a>
        )}

        {!handle && name}
      </Card.Title>
      {description && <Card.Text>{description}</Card.Text>}
    </>
  );
};

const BioCards: React.FC<{ isSzns?: boolean }> = props => {
  const { isSzns } = props;
  const bios = isSzns ? sznBios : bigBrainBios;
  return (
    <>
      {bios.map(bio => (
        <Col xs={6} md={3} lg={3} className={classes.bioGroup}>
          <BioCard {...bio} />
        </Col>
      ))}
    </>
  );
};

const NoundersPage = () => {
  return (
    <Section fullWidth={true} className={classes.noundersPage}>
      <Col lg={{ span: 6, offset: 3 }}>
        <h2>The SZNounders</h2>
        <h3 style={{ marginBottom: '2rem' }}>The SZNS team, with special shoutout to:</h3>
        <Row style={{ marginBottom: '0rem' }}>
          <BioCards isSzns />
        </Row>
        <h3 style={{ marginBottom: '2rem' }}>... and some big brain friends 🧠</h3>
        <Row style={{ marginBottom: '0rem' }}>
          <BioCards />
        </Row>
        <h3>SZNounders' Reward</h3>

        <p style={{ textAlign: 'justify' }}>
          All SZNoun auction proceeds are sent to the SZNouns DAO. For this reason, we, the
          project's founders (‘SZNounders’) have chosen to compensate ourselves with SZNouns. Every
          20th noun for the first 5 years of the project (around 5% of total supply over 5 years)
          will be sent to our multisig, where it will be vested and distributed to individual
          SZNounders.
        </p>
        <p style={{ textAlign: 'justify', paddingBottom: '2rem' }}>
          The SZNounders reward is intended as compensation for our pre and post-launch
          contributions to the project, and to help us participate meaningfully in governance as the
          project matures.
        </p>
      </Col>
    </Section>
  );
};

export default NoundersPage;
