// 仕様に基づくバリデーション関数

export const validateUsername = (username: string): string | null => {
  if (!username || typeof username !== 'string') {
    return 'ユーザー名は必須です';
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return 'ユーザー名は空にできません';
  }

  if (trimmed.length > 20) {
    return 'ユーザー名は20文字以内で入力してください';
  }

  return null;
};

export const validateMessageContent = (content: string): string | null => {
  if (!content || typeof content !== 'string') {
    return 'メッセージ内容は必須です';
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return 'メッセージは空にできません';
  }

  if (trimmed.length > 500) {
    return 'メッセージは500文字以内で入力してください';
  }

  return null;
};

export const sanitizeText = (text: string): string => {
  // XSS対策: HTMLエスケープ
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
