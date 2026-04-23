import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPuzzlePiece} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function DailyPuzzle() {
    return (
        <section className="grid-style col-span-2 col-start-2">
            <h3>Mini jeu</h3>
            <Link to={"/puzzle"} className='flex justify-center items-center min-h-36'>
                <FontAwesomeIcon icon={faPuzzlePiece} className='text-8xl text-violet-500 hover:text-violet-600 hover:animate-spin'/>
            </Link>
        </section>
    );
}