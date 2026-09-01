import { useState } from 'react';
import { useCourses } from '../api/useCourses';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import SearchBox from '../components/SearchBox';

export default function CoursePage() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page);

    return (
        <section>
            <h1>Danh sách môn học</h1>
            <div className="toolbar">
                <SearchBox onSearch={(value) => { setKeyword(value); setPage(0); }} />
            </div>
            <CourseList courses={courses} state={state} errorMessage={errorMessage} onRetry={refetch} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
    );
}
