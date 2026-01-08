import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import LessonUI from '../components/lessonUI'
import Loading from '../components/Loading'

const Title = () => {
  const { topic, order } = useParams();
  const navigate = useNavigate();
  const [titleData, setTitleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user,setuser]=useState(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const cacheKey=`lesson_${topic}_${order}`
        const chachedData=localStorage.getItem(cacheKey);
        if(chachedData){
          const cachedData = JSON.parse(cached);
          setTitleData(cachedData.title);
          setuser(cachedData.userId);
          setLoading(false);
          return;
        }
        const token = localStorage.getItem('token');
        const res = await api.get(`/topics/${encodeURIComponent(topic)}/titles/${order}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTitleData(res.data.title);
        setuser(res.data.userId)
      } catch (e) {
        console.error('Error fetching title content', e);
        setError('Failed to load title');
      } finally {
        setLoading(false);
      }
    };
    if (topic && order) fetchTitle();
  }, [topic, order]);

  if (loading) return <Loading message="lesson"/>
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!titleData) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6">
      
      <LessonUI lesson={titleData} topic={topic} order={order}/>
    </div>
  )
}

export default Title