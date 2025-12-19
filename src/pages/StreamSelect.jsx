
import React from 'react'; import { useParams, useNavigate } from 'react-router-dom'; import { useLang } from '../state/LangContext'
export default function StreamSelect(){ const { difficulty, grade } = useParams(); const nav = useNavigate(); const { t } = useLang()
  return (<div className="card"><h2 className="text-4xl font-bold">{t.selectSubject}</h2><div className="mt-6 grid grid-cols-2 gap-6"><button className="btn" onClick={() => nav(`/subjects/${difficulty}/${grade}/SCIENCE_STREAM`)}>Science</button><button className="btn" onClick={() => nav(`/subjects/${difficulty}/${grade}/COMMERCE_STREAM`)}>Commerce</button></div></div>)
}
