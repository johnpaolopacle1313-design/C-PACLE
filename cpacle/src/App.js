import { useEffect, useRef, useState } from 'react';
import './App.css';

const YEARS = Array.from({ length: 9 }, (_, index) => 2024 - index);
const initialForm = { name: '', year: '', rating: '', cast: '', synopsis: '', poster: '' };
const recommendation = (rating) => Number(rating) < 5 ? 'Not Recommended' : 'Highly Recommended';

function App() {
  const [movies, setMovies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('movies')) || []; } catch { return []; }
  });
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const formRef = useRef(null);

  useEffect(() => { localStorage.setItem('movies', JSON.stringify(movies)); }, [movies]);
  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setError(''); };

  const addMovie = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.year || !form.rating || !form.cast.trim() || !form.synopsis.trim() || !form.poster) {
      setError('Please complete every field and choose a poster before adding the movie.'); return;
    }
    const movie = { ...form, name: form.name.trim(), cast: form.cast.trim(), synopsis: form.synopsis.trim() };
    if (editingIndex === null) {
      setMovies((current) => [...current, movie]);
    } else {
      setMovies((current) => current.map((item, index) => index === editingIndex ? movie : item));
    }
    setForm(initialForm); setEditingIndex(null); event.currentTarget.reset();
  };
  const selectPoster = (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file for the movie poster.'); event.target.value = ''; return; }
    const reader = new FileReader(); reader.onload = () => update('poster', reader.result); reader.readAsDataURL(file);
  };
  const clearForm = () => { setForm(initialForm); setError(''); setEditingIndex(null); formRef.current?.reset(); };
  const editMovie = (index) => {
    setForm({ ...initialForm, ...movies[index] });
    setEditingIndex(index);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setForm(initialForm); setEditingIndex(null); setError(''); };
  const deleteMovie = (index) => {
    if (!window.confirm(`Delete "${movies[index].name}"?`)) return;
    setMovies((current) => current.filter((_, movieIndex) => movieIndex !== index));
    if (editingIndex === index) cancelEdit();
    else if (editingIndex !== null && index < editingIndex) setEditingIndex(editingIndex - 1);
  };

  return <main className="page">
    <section className="panel" aria-labelledby="page-title">
      <header><h1 id="page-title">Movies</h1></header>
      <form className="movie-form" onSubmit={addMovie} ref={formRef}>
        <label>Movie name<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter movie name" /></label>
        <label>Movie poster<input type="file" accept="image/*" onChange={selectPoster} /></label>
        <label>Year released<select value={form.year} onChange={(e) => update('year', e.target.value)}><option value="">Select a year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
        <fieldset><legend>Movie rate</legend><div className="ratings">{Array.from({ length: 10 }, (_, index) => String(index + 1)).map((rating) => <label key={rating} className="rating-option"><input type="radio" name="rating" value={rating} checked={form.rating === rating} onChange={(e) => update('rating', e.target.value)} />{rating}</label>)}</div></fieldset>
        <label>Cast<textarea className="cast-field" value={form.cast} onChange={(e) => update('cast', e.target.value)} placeholder="Enter cast names separated by commas" /></label>
        <label>Synopsis<textarea value={form.synopsis} onChange={(e) => update('synopsis', e.target.value)} placeholder="Write a short synopsis" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions"><button type="submit">{editingIndex === null ? 'Create movie' : 'Update movie'}</button>{editingIndex !== null && <button type="button" className="secondary" onClick={cancelEdit}>Cancel edit</button>}<button type="button" className="secondary" onClick={clearForm}>Clear form</button></div>
      </form>
    </section>
    <section className="movies" aria-live="polite"><h2>Movies ({movies.length})</h2>{movies.length === 0 ? <p className="empty">No movies added yet. Complete the form above to begin.</p> : movies.map((movie, index) => <article className="movie-card" key={`${movie.name}-${index}`}><p className="movie-number">Movie number: {index + 1}</p><img src={movie.poster} alt={`Poster for ${movie.name}`} /><div><h3>{movie.name}</h3><p><strong>Year released:</strong> {movie.year}</p><p><strong>Movie rate:</strong> {movie.rating} – {recommendation(movie.rating)}</p><strong>Cast:</strong>{movie.cast ? <ol className="cast-list">{movie.cast.split(/,|\n/).map((member) => member.trim()).filter(Boolean).map((member, castIndex) => <li key={`${member}-${castIndex}`}>{member}</li>)}</ol> : <p>Not specified</p>}<p className="synopsis">{movie.synopsis}</p><div className="movie-actions"><button type="button" className="edit-button" onClick={() => editMovie(index)}>Edit movie</button><button type="button" className="delete-button" onClick={() => deleteMovie(index)}>Delete movie</button></div></div></article>)}</section>
  </main>;
}
export default App;
