import type { PuzzlesVals } from '../PuzzlesPage';

export default function Edu({ v }: { v: PuzzlesVals }) {
  const { t } = v;
  return (
    <section id="edu" aria-labelledby="edu-title">
      {' '}
      <div className="wrap">
        {' '}
        <div className="edu-head">
          {' '}
          <div>
            {' '}
            <p className="edu-kicker">MindMaze EDU</p> <h2 id="edu-title">{t.ed_title}</h2>{' '}
            <p className="edu-intro">{t.ed_intro}</p>{' '}
          </div>{' '}
          <figure className="edu-fig" aria-label={t.ed_fig}>
            {' '}
            <img src="/media/774615564104119b5122b2c63b75bf5a.webp" alt="" className="fig-l fig-body" />{' '}
            <img src="/media/48af9914e420382cb7a0ac6230b0cade.webp" alt="" className="fig-l fig-head" />{' '}
            <img src="/media/fe83234b77d4ce396b9191505dc04645.webp" alt="" className="fig-l fig-hand" />{' '}
          </figure>{' '}
        </div>{' '}
        <div className="edu-body">
          {' '}
          <div className="edu-col">
            <h3 className="edu-h">{t.ed_glance}</h3>
            <table className="glance">
              <tbody>
                <tr>
                  <th scope="row">{t.ed_where}</th>
                  <td>{t.ed_whereV}</td>
                </tr>
                <tr>
                  <th scope="row">{t.ed_reach}</th>
                  <td>{t.ed_reachV}</td>
                </tr>
                <tr>
                  <th scope="row">{t.ed_format}</th>
                  <td>{t.ed_formatV}</td>
                </tr>
                <tr>
                  <th scope="row">{t.ed_grades}</th>
                  <td>{t.ed_gradesV}</td>
                </tr>
                <tr>
                  <th scope="row">{t.ed_puzzles}</th>
                  <td>{t.ed_puzzlesV}</td>
                </tr>
                <tr>
                  <th scope="row">{t.ed_team}</th>
                  <td>{t.ed_teamV}</td>
                </tr>
              </tbody>
            </table>
          </div>{' '}
          <div className="edu-col">
            {' '}
            <h3 className="edu-h">{t.ed_impact}</h3> <p className="edu-note">{t.ed_note}</p>{' '}
            <div className="stats">
              <div>
                <b>78%</b>
                <span>{t.ed_s0}</span>
              </div>
              <div>
                <b>64%</b>
                <span>{t.ed_s1}</span>
              </div>
              <div>
                <b>91%</b>
                <span>{t.ed_s2}</span>
              </div>
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
