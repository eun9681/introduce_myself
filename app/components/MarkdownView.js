'use client'

function inlineParts(text) {
  const parts = [];
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const key = `${match.index}-${match[0]}`;

    if (match[2] && match[3]) {
      parts.push(
        <a key={key} href={match[3]} target="_blank" rel="noreferrer">
          {match[2]}
        </a>
      );
    } else if (match[4] || match[5]) {
      parts.push(<strong key={key}>{match[4] || match[5]}</strong>);
    } else if (match[6] || match[7]) {
      parts.push(<em key={key}>{match[6] || match[7]}</em>);
    } else if (match[8]) {
      parts.push(<del key={key}>{match[8]}</del>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function isBlockStart(line) {
  return /^#{1,6}\s+/.test(line)
    || /^[-*+]\s+/.test(line)
    || /^[-*+]\s+\[[ xX]\]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^>\s?/.test(line)
    || /^(\*\s*){3,}$|^(-\s*){3,}$|^(_\s*){3,}$/.test(line)
    || isTableStart(line);
}

function isDividerRow(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isTableStart(line, nextLine = '') {
  return line.includes('|') && isDividerRow(nextLine);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderInlineWithBreaks(text, keyPrefix) {
  const lines = text.split(/ {2,}|\n/);

  if (lines.length === 1) return inlineParts(text);

  return lines.flatMap((line, index) => {
    const content = inlineParts(line);
    if (index === lines.length - 1) return content;
    return [...content, <br key={`${keyPrefix}-br-${index}`} />];
  });
}

export default function MarkdownView({ content = '' }) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const nextLine = lines[index + 1]?.trim() || '';

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^(\*\s*){3,}$|^(-\s*){3,}$|^(_\s*){3,}$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    if (isTableStart(trimmed, nextLine)) {
      const headers = splitTableRow(trimmed);
      index += 2;

      const rows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push(
        <div key={`table-${index}`} className="markdown-table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={headerIndex}>{inlineParts(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex}>{inlineParts(row[cellIndex] || '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 6);
      const Tag = `h${level}`;
      blocks.push(<Tag key={`heading-${index}`}>{inlineParts(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+\[[ xX]\]\s+/.test(lines[index].trim())) {
        const item = lines[index].trim();
        items.push({
          checked: /^[-*+]\s+\[[xX]\]\s+/.test(item),
          text: item.replace(/^[-*+]\s+\[[ xX]\]\s+/, ''),
        });
        index += 1;
      }
      blocks.push(
        <ul key={`check-${index}`} className="markdown-checklist">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <input type="checkbox" checked={item.checked} readOnly />
              <span>{inlineParts(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim()) && !/^[-*+]\s+\[[ xX]\]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineParts(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineParts(item)}</li>)}
        </ol>
      );
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quotes = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quotes.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(<blockquote key={`quote-${index}`}>{renderInlineWithBreaks(quotes.join('\n'), `quote-${index}`)}</blockquote>);
      continue;
    }

    const paragraph = [trimmed];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`p-${index}`}>{renderInlineWithBreaks(paragraph.join('\n'), `p-${index}`)}</p>);
  }

  if (!blocks.length) {
    return <p className="markdown-empty">미리보기할 내용이 없습니다.</p>;
  }

  return <div className="markdown-body">{blocks}</div>;
}
