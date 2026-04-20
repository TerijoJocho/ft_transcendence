import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPuzzlePiece} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function DailyPuzzle() {
    return (
        <section className="grid-style col-span-1">
            <h3>Daily Puzzle</h3>
            <Link to={"/puzzle"} className='flex justify-center items-center min-h-36'>
                <FontAwesomeIcon icon={faPuzzlePiece} className='text-8xl'/>
            </Link>
        </section>
    );
}