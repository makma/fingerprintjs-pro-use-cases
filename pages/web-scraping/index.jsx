import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import FlightCard from '../../client/components/web-scraping/FlightCard';
import { useVisitorData } from '../../client/use-visitor-data';

const AIRPORTS = [
  { city: 'San Francisco', code: 'SFO' },
  { city: 'New York', code: 'JFK' },
  { city: 'London', code: 'LHR' },
  { city: 'Tokyo', code: 'HND' },
  { city: 'Paris', code: 'CDG' },
  { city: 'Hong Kong', code: 'HKG' },
  { city: 'Singapore', code: 'SIN' },
  { city: 'Dubai', code: 'DXB' },
  { city: 'Shanghai', code: 'PVG' },
  { city: 'Seoul', code: 'ICN' },
  { city: 'Bangkok', code: 'BKK' },
  { city: 'Amsterdam', code: 'AMS' },
  { city: 'Beijing', code: 'PEK' },
  { city: 'Frankfurt', code: 'FRA' },
  { city: 'Cape Town', code: 'CPT' },
  { city: 'Sydney', code: 'SYD' },
  { city: 'Melbourne', code: 'MEL' },
  { city: 'Toronto', code: 'YYZ' },
  { city: 'Vancouver', code: 'YVR' },
  { city: 'Montreal', code: 'YUL' },
  { city: 'Brussels', code: 'BRU' },
  { city: 'Copenhagen', code: 'CPH' },
  { city: 'Oslo', code: 'OSL' },
  { city: 'Stockholm', code: 'ARN' },
  { city: 'Helsinki', code: 'HEL' },
  { city: 'Rome', code: 'FCO' },
];

export const WebScrapingUseCase = () => {
  const [from, setFrom] = useState(AIRPORTS[0].code);
  const [to, setTo] = useState(AIRPORTS[1].code);

  /** @typedef {import('../../client/components/web-scraping/FlightCard').Flight} Flight */
  /** @type {[Flight[], React.Dispatch<Flight[]>]} */
  const [flights, setFlights] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Don't invoke query on mount
  const visitorDataQuery = useVisitorData({ enabled: false });

  /**
  //* @type {React.FormEventHandler<HTMLFormElement>}
  //*/
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const { data } = await visitorDataQuery.refetch();
    try {
      const results = await (
        await fetch(`/api/web-scraping/flights?from=${from}&to=${to}&requestId=${data.requestId}`)
      ).json();
      setLoading(false);
      setMessage(results.message);
      setFlights(results.data.flights);
    } catch (error) {
      setLoading(false);
      setMessage(error.toString());
      console.log(error);
    }
  }

  return (
    <>
      <UseCaseWrapper
        title="Web Scraping Prevention"
        description={`
          Web scraping is the process of extracting data from websites.
          It is a powerful tool for data scientists and researchers, 
          but it can also be used for malicious purposes. 
          In this use case, we will show how to prevent web scraping with Fingerprint Pro
        `}
        articleURL="https://fingerprintjs.com/blog/web-scraping-prevention/"
        listItems={[<>In this demo we will do something fun</>]}
      >
        <h1>Search for today&apos;s flights</h1>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel id="from">From</InputLabel>
            <Select labelId="from" id="from-select" value={from} label="From" onChange={(e) => setFrom(e.target.value)}>
              {AIRPORTS.filter((airport) => airport.code !== to).map((airport) => (
                <MenuItem key={airport.code} value={airport.code}>{`${airport.city} (${airport.code})`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="to">To</InputLabel>
            <Select labelId="to" id="to-select" value={to} label="To" onChange={(e) => setTo(e.target.value)}>
              {AIRPORTS.filter((airport) => airport.code !== from).map((airport) => (
                <MenuItem key={airport.code} value={airport.code}>{`${airport.city} (${airport.code})`}</MenuItem>
              ))}
            </Select>
            {
              <Button type="submit" size="large" variant="contained" color="primary" disableElevation fullWidth>
                Search flights
              </Button>
            }
            {loading && <CircularProgress />}
            {!loading && message}
          </FormControl>
        </form>
        {flights?.length > 0 && !loading && (
          <div>
            <h2>Results</h2>
            {flights.map((flight) => (
              <FlightCard key={flight.flightNumber} flight={flight} />
            ))}
          </div>
        )}
      </UseCaseWrapper>
    </>
  );
};

export default WebScrapingUseCase;
