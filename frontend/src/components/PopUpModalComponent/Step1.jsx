import { useState, useEffect, useRef } from "react";

function Step1({ pinData, setPinData, nextStep, closeModal }) {
  const [query, setQuery] = useState(pinData.anime || "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setPinData({ ...pinData, anime: "" });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3006/api/anime?search=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.animes || []);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 350); // wait 350ms after user stops typing
  };

  const handleSelect = (animeName) => {
    setQuery(animeName);
    setPinData({ ...pinData, anime: animeName });
    setShowDropdown(false);
    setResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="modal-step">
      <h2>Create Pin</h2>

      <input
        placeholder="Title"
        value={pinData.title}
        onChange={(e) =>
          setPinData({
            ...pinData,
            title: e.target.value,
          })
        }
      />

      <div ref={wrapperRef} className="anime-input-wrapper" style={{ position: "relative" }}>
        <input
          placeholder="Anime Name"
          value={query}
          onChange={handleInputChange}
          autoComplete="off"
        />

        {isLoading && <div className="dropdown-loading">Searching...</div>}

        {showDropdown && results.length > 0 && (
          <ul className="anime-dropdown">
            {results.map((name, i) => (
              <li key={i} onMouseDown={() => handleSelect(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}

        {showDropdown && !isLoading && results.length === 0 && (
          <div className="dropdown-empty">No results found</div>
        )}
      </div>
      
      <textarea
        placeholder="Description"
        value={pinData.description}
        onChange={(e) =>
          setPinData({
            ...pinData,
            description: e.target.value,
          })
        }
      />

      
      <div className="modal-buttons">
        <button onClick={closeModal}>
          Cancel
        </button>

      <button
        onClick={nextStep}
        disabled={!pinData.anime}
      >
        Next
      </button>
      </div>
    </div>
  );
}

export default Step1;