import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPuzzlePiece} from '@fortawesome/free-solid-svg-icons';

export default function DailyPuzzle() {
    return (
        <section className="grid-style col-span-1">
            <h3>Daily Puzzle</h3>
            <div className='flex justify-center items-center min-h-36'>
                <FontAwesomeIcon icon={faPuzzlePiece} className='text-5xl sm:text-7xl md:text-8xl'/>
            </div>
        </section>
    );
}