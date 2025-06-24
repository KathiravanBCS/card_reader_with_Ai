import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, ListGroup, Container, Spinner } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchBox from './SearchBox';

const CARDS_PER_PAGE = 10;

// Fetch function for paginated cards
const fetchCardsPaginated = async ({ pageParam = 1, queryKey }) => {
  const [_key, search] = queryKey;
  const params = new URLSearchParams({
    page: pageParam,
    limit: CARDS_PER_PAGE,
    search: search || '',
  });
  const res = await fetch(`http://localhost:5000/cards?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
};

const Home = () => {
  const [search, setSearch] = useState('');
  const observerRef = useRef();

  // Infinite query for cards
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['cards', search],
    queryFn: fetchCardsPaginated,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
  });

  // Combine all loaded cards
  const cards = data ? data.pages.flatMap(page => page.cards) : [];

  // Intersection observer for infinite scroll
  const lastCardRef = useCallback(
    node => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new window.IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  // Handle search
  const handleSearch = e => {
    setSearch(e.target.value);
    refetch();
  };

  return (
    <Container className="mb-5">
      <SearchBox
        value={search}
        onChange={handleSearch}
        placeholder="Search by name, title, or company..."
      />
      {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <div className="text-danger text-center">Failed to load cards.</div>}
      <ListGroup>
        {cards.map((card, idx) => {
          const isLast = idx === cards.length - 1;
          return (
            <Link to={`/card/${card.id}`} key={card.id} className="text-decoration-none">
              <Card
                ref={isLast ? lastCardRef : undefined}
                className="mb-3 shadow-sm border-0 w-100 card-modern"
                style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(90deg, #e3f0ff 0%, #f8faff 100%)',
                  border: '1px solid #d0e2ff',
                  boxShadow: '0 4px 16px rgba(21,101,255,0.07)',
                  minHeight: 110,
                  maxHeight: 110,
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <Card.Body className="d-flex align-items-center w-100" style={{ minHeight: 90, padding: 18 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px #b3c6ff33' }}>
                    {card.image && typeof card.image === 'string' && card.image.length > 100 ? (
                      (() => {
                        let mime = 'image/jpeg';
                        if (card.image.startsWith('/9j/')) mime = 'image/jpeg';
                        if (card.image.startsWith('iVBOR')) mime = 'image/png';
                        return (
                          <img
                            src={`data:${mime};base64,${card.image}`}
                            alt="card"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        );
                      })()
                    ) : card.image_url ? (
                      <img src={card.image_url} alt="card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src="/vite.svg" alt="placeholder" style={{ width: '60%', height: '60%', objectFit: 'contain', opacity: 0.7 }} />
                    )}
                  </div>
                  <div className="ms-3 flex-grow-1 d-flex flex-column justify-content-center" style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span className="fw-bold" style={{ fontSize: '1rem', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: 0.2 }}>{card.name || 'No Name'}</span>
                      {card.title && (
                        <span style={{ fontSize: '0.93rem', color: '#000', marginLeft: 6, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          ({card.title})
                        </span>
                      )}
                    </div>
                    {card.company_name && (
                      <div className="text-secondary" style={{ fontSize: '0.92rem', color: '#3b4a5a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.company_name}</div>
                    )}
                    <div style={{ display: 'flex', gap: 24, marginTop: 2 }}>
                      {card.phone_number && (
                        <a
                          href={`tel:${card.phone_number.replace(/[^+\d]/g, '')}`}
                          style={{ fontSize: '0.97rem', color: '#000', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <i className="bi bi-telephone me-1" />{card.phone_number}
                        </a>
                      )}
                      {card.email && (
                        <a
                          href={`mailto:${card.email}`}
                          style={{ fontSize: '0.97rem', color: '#000', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <i className="bi bi-envelope me-1" />{card.email}
                        </a>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          );
        })}
      </ListGroup>
      {isFetchingNextPage && (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      )}
    </Container>
  );
};

export default Home;